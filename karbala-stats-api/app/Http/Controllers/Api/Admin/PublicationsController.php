<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicationResource;
use App\Models\ActivityLog;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicationsController extends Controller
{
    public function index(Request $request)
    {
        $query = Publication::with('category');

        if ($request->filled('status'))      $query->where('status', $request->status);
        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);
        if ($request->filled('search'))      $query->where('title_ar', 'like', '%' . $request->search . '%');

        $perPage = min((int)($request->per_page ?? 15), 50);

        $page = $query->orderByDesc('created_at')->paginate($perPage);
        return response()->json([
            'data'         => PublicationResource::collection($page->items()),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
            'from'         => $page->firstItem(),
            'to'           => $page->lastItem(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title_ar'    => 'required|string|min:5|max:500',
            'category_id' => 'required|exists:categories,id',
            'status'      => 'required|in:draft,published,archived',
            'cover_image' => 'nullable|image|max:5120',
            'file'        => 'nullable|file|mimes:pdf,xlsx,xls,csv|max:51200',
        ]);

        $data               = $request->except(['cover_image', 'file']);
        $data['created_by'] = auth()->id();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        if ($request->hasFile('file')) {
            $file              = $request->file('file');
            $data['file_path'] = $file->store('publications', 'public');
            $data['file_type'] = $file->getClientOriginalExtension();
            $data['file_size'] = $file->getSize();
        }

        $pub = Publication::create($data);
        ActivityLog::record(auth()->id(), 'create_publication', 'publication', $pub->id, ['title' => $pub->title_ar]);

        return new PublicationResource($pub->load('category'));
    }

    public function show(int $id)
    {
        return new PublicationResource(Publication::with(['category','creator'])->withTrashed()->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $pub = Publication::withTrashed()->findOrFail($id);

        $request->validate([
            'title_ar'    => 'sometimes|required|string|min:5|max:500',
            'category_id' => 'sometimes|required|exists:categories,id',
            'status'      => 'sometimes|required|in:draft,published,archived',
            'cover_image' => 'nullable|image|max:5120',
            'file'        => 'nullable|file|mimes:pdf,xlsx,xls,csv|max:51200',
        ]);

        $data = $request->except(['cover_image', 'file']);

        if ($request->hasFile('cover_image')) {
            if ($pub->cover_image) Storage::disk('public')->delete($pub->cover_image);
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        if ($request->hasFile('file')) {
            if ($pub->file_path) Storage::disk('public')->delete($pub->file_path);
            $file              = $request->file('file');
            $data['file_path'] = $file->store('publications', 'public');
            $data['file_type'] = $file->getClientOriginalExtension();
            $data['file_size'] = $file->getSize();
        }

        $pub->update($data);
        ActivityLog::record(auth()->id(), 'update_publication', 'publication', $pub->id, ['title' => $pub->title_ar]);

        return new PublicationResource($pub->fresh()->load('category'));
    }

    public function destroy(int $id)
    {
        $pub = Publication::findOrFail($id);
        $pub->delete();
        ActivityLog::record(auth()->id(), 'delete_publication', 'publication', $pub->id);
        return response()->json(['success' => true]);
    }
}
