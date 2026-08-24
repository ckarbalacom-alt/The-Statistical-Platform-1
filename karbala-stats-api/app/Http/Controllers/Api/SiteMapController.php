<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategoryPageResource;
use App\Models\Category;
use App\Models\CategoryPage;

class SiteMapController extends Controller
{
    public function index()
    {
        $roots = Category::active()
            ->whereNull('parent_id')
            ->where('icon', 'SiteSection')
            ->with([
                'children' => fn ($q) => $q->active()->orderBy('display_order'),
                'children.children' => fn ($q) => $q->active()->orderBy('display_order'),
                'page' => fn ($q) => $q->published(),
            ])
            ->orderBy('display_order')
            ->get();

        return CategoryResource::collection($roots);
    }

    public function show(string $slug)
    {
        $category = Category::active()
            ->with([
                'parent',
                'children' => fn ($q) => $q->active()->orderBy('display_order'),
                'children.page' => fn ($q) => $q->published(),
                'page' => fn ($q) => $q->published(),
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        $page = CategoryPage::with(['category', 'author'])
            ->published()
            ->where('category_id', $category->id)
            ->first();

        return response()->json([
            'category' => new CategoryResource($category),
            'page' => $page ? new CategoryPageResource($page) : null,
        ]);
    }
}
