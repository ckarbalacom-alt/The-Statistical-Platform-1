<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryPageResource;
use App\Models\ActivityLog;
use App\Models\CategoryPage;
use Illuminate\Http\Request;

class CategoryPagesController extends Controller
{
    public function index(Request $request)
    {
        $query = CategoryPage::with(['category', 'author']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) ($request->per_page ?? 20), 100);
        $page = $query->orderByDesc('updated_at')->paginate($perPage);

        return response()->json([
            'data' => CategoryPageResource::collection($page->items()),
            'current_page' => $page->currentPage(),
            'last_page' => $page->lastPage(),
            'per_page' => $page->perPage(),
            'total' => $page->total(),
            'from' => $page->firstItem(),
            'to' => $page->lastItem(),
        ]);
    }

    public function showByCategory(int $categoryId)
    {
        $page = CategoryPage::with(['category', 'author'])
            ->where('category_id', $categoryId)
            ->first();

        return response()->json(['data' => $page ? new CategoryPageResource($page) : null]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title_ar' => 'required|string|min:2|max:300',
            'title_en' => 'nullable|string|max:300',
            'summary_ar' => 'nullable|string|max:5000',
            'body_ar' => 'nullable|string',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        $data['author_id'] = auth()->id();
        $data['is_featured'] = filter_var($data['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $page = CategoryPage::updateOrCreate(
            ['category_id' => $data['category_id']],
            $data,
        );

        ActivityLog::record(auth()->id(), 'publish_category_page', 'category_page', $page->id);

        return new CategoryPageResource($page->load(['category', 'author']));
    }
}
