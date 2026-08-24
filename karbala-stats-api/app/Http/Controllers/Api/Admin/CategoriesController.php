<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\ActivityLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoriesController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with(['parent'])
            ->withCount(['publications', 'indicators', 'newsArticles']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'like', '%' . $search . '%')
                    ->orWhere('name_en', 'like', '%' . $search . '%')
                    ->orWhere('slug', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('parent_id')) {
            $request->parent_id === 'root'
                ? $query->whereNull('parent_id')
                : $query->where('parent_id', $request->parent_id);
        }

        $perPage = min((int) ($request->per_page ?? 20), 100);
        $page = $query
            ->orderByRaw('parent_id is not null')
            ->orderBy('parent_id')
            ->orderBy('display_order')
            ->orderBy('name_ar')
            ->paginate($perPage);

        return response()->json([
            'data'         => CategoryResource::collection($page->items()),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
            'from'         => $page->firstItem(),
            'to'           => $page->lastItem(),
        ]);
    }

    public function tree()
    {
        $roots = Category::with(['children' => fn ($q) => $q->orderBy('display_order')])
            ->whereNull('parent_id')
            ->orderBy('display_order')
            ->get();

        return CategoryResource::collection($roots);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $data = $this->normalizeData($data);

        $category = Category::create($data);
        ActivityLog::record(auth()->id(), 'create_category', 'category', $category->id);

        return new CategoryResource($category->load('parent'));
    }

    public function show(int $id)
    {
        return new CategoryResource(Category::with(['parent', 'children'])->withCount(['publications', 'indicators', 'newsArticles'])->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);
        $data = $this->validatedData($request, $category->id);
        $data = $this->normalizeData($data);

        if (!empty($data['parent_id']) && (int) $data['parent_id'] === $category->id) {
            return response()->json(['errors' => ['parent_id' => ['لا يمكن جعل التصنيف أباً لنفسه']]], 422);
        }

        $category->update($data);
        ActivityLog::record(auth()->id(), 'update_category', 'category', $category->id);

        return new CategoryResource($category->fresh()->load('parent'));
    }

    public function destroy(int $id)
    {
        $category = Category::withCount(['children', 'publications', 'indicators', 'newsArticles'])->findOrFail($id);

        if ($category->children_count || $category->publications_count || $category->indicators_count || $category->news_articles_count) {
            return response()->json([
                'message' => 'لا يمكن حذف تصنيف يحتوي على فروع أو محتوى مرتبط. يمكن تعطيله بدلاً من الحذف.',
            ], 422);
        }

        $category->delete();
        ActivityLog::record(auth()->id(), 'delete_category', 'category', $id);

        return response()->json(['success' => true]);
    }

    public function toggleActive(int $id)
    {
        $category = Category::findOrFail($id);
        $category->update(['is_active' => !$category->is_active]);

        return response()->json(['success' => true, 'is_active' => $category->is_active]);
    }

    private function validatedData(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'name_ar'        => 'required|string|min:2|max:200',
            'name_en'        => 'nullable|string|max:200',
            'slug'           => ['nullable', 'string', 'max:200', Rule::unique('categories', 'slug')->ignore($id)],
            'description_ar' => 'nullable|string|max:5000',
            'icon'           => 'nullable|string|max:100',
            'parent_id'      => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($q) => $id ? $q->where('id', '!=', $id) : $q)],
            'display_order'  => 'nullable|integer|min:0|max:9999',
            'is_active'      => 'nullable|boolean',
        ]);
    }

    private function normalizeData(array $data): array
    {
        $data['slug'] = $data['slug'] ?: Str::slug($data['name_en'] ?: $data['name_ar']);
        $data['parent_id'] = $data['parent_id'] ?? null;
        $data['display_order'] = $data['display_order'] ?? 0;
        $data['is_active'] = array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true;

        if (empty($data['icon'])) {
            $data['icon'] = empty($data['parent_id']) ? 'SiteSection' : 'FolderTree';
        }

        return $data;
    }
}
