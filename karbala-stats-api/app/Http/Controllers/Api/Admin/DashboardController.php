<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Indicator;
use App\Models\Publication;
use App\Models\StatisticalRequest;

class DashboardController extends Controller
{
    public function index()
    {
        $requestStats = StatisticalRequest::getStats();

        $downloadsThisMonth = Publication::whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->sum('downloads_count');

        $actionLabels = [
            'create_publication' => 'أضاف إصداراً',
            'update_publication' => 'عدّل إصداراً',
            'delete_publication' => 'حذف إصداراً',
            'create_indicator'   => 'أضاف مؤشراً',
            'update_indicator'   => 'عدّل مؤشراً',
            'delete_indicator'   => 'حذف مؤشراً',
            'create_user'        => 'أضاف مستخدماً',
            'update_user'        => 'عدّل مستخدماً',
            'delete_user'        => 'حذف مستخدماً',
            'update_settings'    => 'عدّل الإعدادات',
            'create_news'        => 'أضاف خبراً',
            'update_news'        => 'عدّل خبراً',
            'delete_news'        => 'حذف خبراً',
        ];

        $recentActivity = ActivityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'id'          => $log->id,
                'action'      => $log->action,
                'description' => $actionLabels[$log->action] ?? $log->action,
                'created_at'  => $log->created_at->toDateTimeString(),
                'user'        => $log->user ? ['name_ar' => $log->user->name_ar] : null,
            ]);

        $recentRequests = StatisticalRequest::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'request_code', 'requester_name', 'request_type', 'status', 'created_at'])
            ->map(fn($r) => [
                'id'             => $r->id,
                'request_code'   => $r->request_code,
                'requester_name' => $r->requester_name,
                'request_type'   => $r->request_type,
                'status'         => $r->status,
                'created_at'     => $r->created_at->toDateTimeString(),
            ]);

        return response()->json([
            'publications_count'  => Publication::count(),
            'indicators_count'    => Indicator::count(),
            'requests_count'      => $requestStats['total'],
            'downloads_this_month'=> (int) $downloadsThisMonth,
            'requests_by_status'  => [
                'pending'    => $requestStats['pending'],
                'processing' => $requestStats['processing'],
                'completed'  => $requestStats['completed'],
                'rejected'   => $requestStats['rejected'],
            ],
            'recent_activity' => $recentActivity,
            'recent_requests' => $recentRequests,
        ]);
    }
}
