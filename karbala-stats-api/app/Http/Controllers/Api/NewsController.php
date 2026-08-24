<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsArticleResource;
use App\Models\NewsArticle;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = NewsArticle::with(['author', 'category'])->published();

        if ($request->filled('type')) $query->where('article_type', $request->type);
        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);

        $perPage = min((int)($request->per_page ?? 10), 50);

        $page = $query->orderByDesc('published_at')->paginate($perPage);
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

    public function show(int $id)
    {
        $article = NewsArticle::with(['author', 'category'])->published()->findOrFail($id);
        $article->incrementViews();

        $related = NewsArticle::with('category')->published()
            ->where(function ($query) use ($article) {
                $query->where('article_type', $article->article_type);
                if ($article->category_id) {
                    $query->orWhere('category_id', $article->category_id);
                }
            })
            ->where('id', '!=', $article->id)
            ->orderByDesc('published_at')
            ->limit(3)->get();

        return response()->json([
            'data'    => new NewsArticleResource($article),
            'related' => NewsArticleResource::collection($related),
        ]);
    }

    public function featured()
    {
        $articles = NewsArticle::with(['author', 'category'])->published()->featured()
            ->orderByDesc('published_at')->limit(5)->get();
        return NewsArticleResource::collection($articles);
    }
}
