<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicationResource;
use App\Models\Publication;
use Illuminate\Http\Request;

class PublicationsController extends Controller
{
    public function index(Request $request)
    {
        $query = Publication::with('category')->published();

        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);
        if ($request->filled('year'))        $query->where('stat_year', $request->year);
        if ($request->filled('type'))        $query->where('file_type', $request->type);

        if ($request->filled('q')) {
            $term = $request->q;
            $query->whereRaw('MATCH(title_ar, title_en, description_ar) AGAINST(? IN BOOLEAN MODE)', [$term . '*']);
        }

        match ($request->sort) {
            'downloads' => $query->orderByDesc('downloads_count'),
            'views' => $query->orderByDesc('views_count'),
            default => $query->orderByRaw('COALESCE(release_date, published_at, created_at) desc'),
        };

        $perPage = min((int)($request->per_page ?? 12), 50);
        $page = $query->paginate($perPage);

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

    public function show(int $id)
    {
        $pub = Publication::with(['category', 'creator'])->published()->findOrFail($id);
        $pub->incrementViews();

        $related = Publication::with('category')
            ->published()
            ->where('category_id', $pub->category_id)
            ->where('id', '!=', $pub->id)
            ->limit(4)->get();

        return response()->json([
            'data'    => new PublicationResource($pub),
            'related' => PublicationResource::collection($related),
        ]);
    }

    public function featured()
    {
        $pubs = Publication::with('category')->published()->featured()->orderByDesc('release_date')->limit(6)->get();
        return PublicationResource::collection($pubs);
    }

    public function download(int $id)
    {
        $pub = Publication::published()->findOrFail($id);
        $pub->incrementDownloads();
        return response()->json(['success' => true, 'url' => asset('storage/' . $pub->file_path)]);
    }
}
