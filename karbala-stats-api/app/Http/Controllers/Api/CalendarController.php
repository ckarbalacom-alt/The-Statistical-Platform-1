<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StatisticalCalendar;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $year  = $request->year ?? now()->year;
        $month = $request->month ?? null;

        $query = StatisticalCalendar::with('publication')
            ->whereYear('release_date', $year);

        if ($month) $query->whereMonth('release_date', $month);

        $events = $query->orderBy('release_date')->get();

        return response()->json($events->map(fn($e) => [
            'id'                 => $e->id,
            'title_ar'           => $e->title_ar,
            'title_en'           => $e->title_en,
            'release_date'       => $e->release_date->format('Y-m-d'),
            'release_time'       => $e->release_time,
            'indicator_category' => $e->indicator_category,
            'status'             => $e->status,
            'notes_ar'           => $e->notes_ar,
            'publication_id'     => $e->publication_id,
        ]));
    }

    public function upcoming(Request $request)
    {
        $days   = min((int)($request->days ?? 30), 90);
        $events = StatisticalCalendar::upcoming($days)->get();

        return response()->json($events->map(fn($e) => [
            'id'                 => $e->id,
            'title_ar'           => $e->title_ar,
            'release_date'       => $e->release_date->format('Y-m-d'),
            'indicator_category' => $e->indicator_category,
            'status'             => $e->status,
        ]));
    }
}
