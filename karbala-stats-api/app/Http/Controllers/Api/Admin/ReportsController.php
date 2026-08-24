<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Indicator;
use App\Models\Publication;
use App\Models\StatisticalRequest;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function index()
    {
        $requestStats = StatisticalRequest::getStats();

        $topCategories = Category::withCount('publications')
            ->having('publications_count', '>', 0)
            ->orderByDesc('publications_count')
            ->limit(8)
            ->get(['id', 'name_ar'])
            ->map(fn($c) => [
                'name_ar'            => $c->name_ar,
                'publications_count' => $c->publications_count,
            ]);

        return response()->json([
            'publications_total'      => Publication::count(),
            'publications_this_year'  => Publication::whereYear('created_at', now()->year)->count(),
            'indicators_total'        => Indicator::count(),
            'requests_total'          => $requestStats['total'],
            'requests_completed'      => $requestStats['completed'],
            'requests_pending'        => $requestStats['pending'],
            'downloads_total'         => (int) Publication::sum('downloads_count'),
            'top_categories'          => $topCategories,
        ]);
    }

    public function exportByType(string $type)
    {
        return match($type) {
            'publications' => $this->exportPublications(),
            'requests'     => $this->exportRequests(),
            default        => response()->json(['message' => 'نوع التصدير غير صحيح'], 422),
        };
    }

    private function exportPublications()
    {
        $publications = Publication::with('category')
            ->orderByDesc('release_date')
            ->get(['id', 'title_ar', 'title_en', 'stat_year', 'downloads_count', 'views_count', 'release_date', 'status', 'category_id'])
            ->map(fn($p) => [
                'id'           => $p->id,
                'title_ar'     => $p->title_ar,
                'category'     => $p->category?->name_ar,
                'year'         => $p->stat_year,
                'status'       => $p->status,
                'downloads'    => $p->downloads_count,
                'views'        => $p->views_count,
                'release_date' => $p->release_date?->format('Y-m-d'),
            ]);

        return response()->json(['data' => $publications, 'total' => $publications->count()]);
    }

    private function exportRequests()
    {
        $requests = StatisticalRequest::orderByDesc('created_at')
            ->get(['id', 'request_code', 'requester_name', 'requester_email', 'request_type', 'status', 'created_at'])
            ->map(fn($r) => [
                'code'       => $r->request_code,
                'name'       => $r->requester_name,
                'email'      => $r->requester_email,
                'type'       => $r->request_type,
                'status'     => $r->status,
                'created_at' => $r->created_at->format('Y-m-d'),
            ]);

        return response()->json(['data' => $requests, 'total' => $requests->count()]);
    }
}
