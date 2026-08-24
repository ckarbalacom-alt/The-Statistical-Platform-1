<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoriesController extends Controller
{
    public function index()
    {
        $categories = Category::active()->withCount('publications')->orderBy('display_order')->get();
        return CategoryResource::collection($categories);
    }

    public function tree()
    {
        $roots = Category::active()->roots()->with('children')->orderBy('display_order')->get();
        return CategoryResource::collection($roots);
    }
}
