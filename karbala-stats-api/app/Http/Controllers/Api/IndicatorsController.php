<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IndicatorResource;
use App\Models\Indicator;
use App\Models\IndicatorDataPoint;
use Illuminate\Http\Request;

class IndicatorsController extends Controller
{
    public function index(Request $request)
    {
        $query = Indicator::with('category')->active();

        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);
        if ($request->featured)              $query->featured();

        return IndicatorResource::collection($query->orderByDesc('is_featured')->get());
    }

    public function show(int $id)
    {
        $indicator = Indicator::with([
            'category',
            'dataPoints' => fn($q) => $q->orderBy('period_sort')->limit(30),
        ])->active()->findOrFail($id);

        return new IndicatorResource($indicator);
    }

    public function chartData(int $id, Request $request)
    {
        $periodType = $request->period_type ?? 'yearly';

        $points = IndicatorDataPoint::where('indicator_id', $id)
            ->where('period_type', $periodType)
            ->orderBy('period_sort')
            ->limit(30)
            ->get();

        return response()->json([
            'labels' => $points->pluck('period_label'),
            'values' => $points->pluck('value')->map(fn($v) => (float)$v),
        ]);
    }
}
