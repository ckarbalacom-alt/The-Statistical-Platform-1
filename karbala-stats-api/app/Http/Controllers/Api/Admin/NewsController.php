<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsArticleResource;
use App\Models\ActivityLog;
use App\Models\NewsArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = NewsArticle::with(['author', 'category']);

        if ($request->filled('type'))   $query->where('article_type', $request->type);
        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);
        if ($request->filled('search')) $query->where('title_ar', 'like', '%' . $request->search . '%');

        $perPage = min((int)($request->per_page ?? 15), 50);

        $page = $query->orderByDesc('created_at')->paginate($perPage);
        return response()->json([
            'data'         => NewsArticleResource::collection($page->items()),
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
            'title_ar'     => 'required|string|min:5|max:500',
            'article_type' => 'required|in:news,event,announcement',
            'category_id'  => 'nullable|exists:categories,id',
            'body_ar'      => 'nullable|string',
            'thumbnail'    => 'nullable|image|max:5120',
            'published_at' => 'nullable|date',
            'is_featured'  => 'nullable',
            'tags'         => 'nullable',
        ]);

        $data              = $request->except('thumbnail');
        $data['author_id'] = auth()->id();
        $data['is_featured'] = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
        if (empty($data['published_at'])) {
            $data['published_at'] = now();
        }
        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_values(array_filter(array_map('trim', explode(',', $data['tags']))));
        }

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $article = NewsArticle::create($data);
        ActivityLog::record(auth()->id(), 'create_news', 'news_article', $article->id);

        return new NewsArticleResource($article->load(['author', 'category']));
    }

    public function show(int $id)
    {
        return new NewsArticleResource(NewsArticle::with(['author', 'category'])->withTrashed()->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $article = NewsArticle::findOrFail($id);

        $request->validate([
            'title_ar'     => 'sometimes|required|string|min:5|max:500',
            'article_type' => 'sometimes|required|in:news,event,announcement',
            'category_id'  => 'nullable|exists:categories,id',
            'body_ar'      => 'nullable|string',
            'thumbnail'    => 'nullable|image|max:5120',
            'published_at' => 'nullable|date',
            'is_featured'  => 'nullable',
            'tags'         => 'nullable',
        ]);

        $data = $request->except('thumbnail');
        if (array_key_exists('is_featured', $data)) {
            $data['is_featured'] = filter_var($data['is_featured'], FILTER_VALIDATE_BOOLEAN);
        }
        if (array_key_exists('published_at', $data) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }
        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_values(array_filter(array_map('trim', explode(',', $data['tags']))));
        }
        if ($request->hasFile('thumbnail')) {
            if ($article->thumbnail) Storage::disk('public')->delete($article->thumbnail);
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $article->update($data);
        ActivityLog::record(auth()->id(), 'update_news', 'news_article', $article->id);

        return new NewsArticleResource($article->fresh()->load(['author', 'category']));
    }

    public function destroy(int $id)
    {
        $article = NewsArticle::findOrFail($id);
        $article->delete();
        ActivityLog::record(auth()->id(), 'delete_news', 'news_article', $id);
        return response()->json(['success' => true]);
    }
}
