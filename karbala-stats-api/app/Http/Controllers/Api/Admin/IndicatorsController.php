<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\IndicatorResource;
use App\Models\ActivityLog;
use App\Models\Indicator;
use App\Models\IndicatorDataPoint;
use Illuminate\Http\Request;

class IndicatorsController extends Controller
{
    public function index(Request $request)
    {
        $query = Indicator::with('category');

        if ($request->filled('category_id')) $query->where('category_id', $request->category_id);
        if ($request->filled('search'))      $query->where('name_ar', 'like', '%' . $request->search . '%');

        $perPage = min((int)($request->per_page ?? 15), 50);

        $page = $query->orderByDesc('created_at')->paginate($perPage);
        return response()->json([
            'data'         => IndicatorResource::collection($page->items()),
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
            'name_ar'        => 'required|string|min:3|max:300',
            'name_en'        => 'nullable|string|max:300',
            'category_id'    => 'nullable|exists:categories,id',
            'unit_ar'        => 'nullable|string|max:100',
            'unit_en'        => 'nullable|string|max:100',
            'source'         => 'nullable|string|max:255',
            'methodology_ar' => 'nullable|string',
            'is_featured'    => 'nullable',
        ]);

        $data = $request->only(['name_ar','name_en','category_id','unit_ar','unit_en','source','methodology_ar']);
        $data['is_featured'] = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);

        $indicator = Indicator::create($data);
        ActivityLog::record(auth()->id(), 'create_indicator', 'indicator', $indicator->id);

        return new IndicatorResource($indicator->load('category'));
    }

    public function show(int $id)
    {
        return new IndicatorResource(Indicator::with(['category','dataPoints'])->findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $indicator = Indicator::findOrFail($id);
        $request->validate([
            'name_ar'        => 'sometimes|required|string|min:3|max:300',
            'name_en'        => 'nullable|string|max:300',
            'category_id'    => 'nullable|exists:categories,id',
            'unit_ar'        => 'nullable|string|max:100',
            'unit_en'        => 'nullable|string|max:100',
            'source'         => 'nullable|string|max:255',
            'methodology_ar' => 'nullable|string',
            'is_featured'    => 'nullable',
        ]);
        $data = $request->only(['name_ar','name_en','category_id','unit_ar','unit_en','source','methodology_ar']);
        if ($request->has('is_featured')) {
            $data['is_featured'] = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
        }
        $indicator->update($data);
        ActivityLog::record(auth()->id(), 'update_indicator', 'indicator', $indicator->id);

        return new IndicatorResource($indicator->fresh()->load('category'));
    }

    public function destroy(int $id)
    {
        $indicator = Indicator::findOrFail($id);
        $indicator->delete();
        ActivityLog::record(auth()->id(), 'delete_indicator', 'indicator', $indicator->id);
        return response()->json(['success' => true]);
    }

    public function storeDataPoint(Request $request, int $id)
    {
        $indicator = Indicator::findOrFail($id);

        $request->validate([
            'period_type'  => 'required|in:yearly,quarterly,monthly',
            'period_label' => 'required|string|max:50',
            'period_sort'  => 'nullable|integer',
            'value'        => 'required|numeric',
            'notes'        => 'nullable|string',
        ]);

        $dp = $indicator->dataPoints()->updateOrCreate(
            ['period_label' => $request->period_label],
            $request->only(['period_type','period_label','period_sort','value','notes'])
        );

        $indicator->updateLatestStats();

        return response()->json($dp, 201);
    }

    public function destroyDataPoint(int $id, int $dpId)
    {
        $dp = IndicatorDataPoint::where('indicator_id', $id)->findOrFail($dpId);
        $dp->delete();
        Indicator::find($id)?->updateLatestStats();
        return response()->json(['success' => true]);
    }
}
