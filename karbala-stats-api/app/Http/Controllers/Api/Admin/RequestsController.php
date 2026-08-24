<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\StatisticalRequest;
use Illuminate\Http\Request;

class RequestsController extends Controller
{
    public function index(Request $request)
    {
        $query = StatisticalRequest::with('assignedUser');

        if ($request->filled('status'))       $query->where('status', $request->status);
        if ($request->filled('request_type')) $query->where('request_type', $request->request_type);
        if ($request->filled('search'))        $query->where('requester_name', 'like', '%' . $request->search . '%');

        $perPage = min((int)($request->per_page ?? 15), 50);

        return response()->json($query->orderByDesc('created_at')->paginate($perPage));
    }

    public function show(int $id)
    {
        return response()->json(StatisticalRequest::with('assignedUser')->findOrFail($id));
    }

    public function updateStatus(Request $request, int $id)
    {
        $req = StatisticalRequest::findOrFail($id);

        $request->validate([
            'status'           => 'required|in:pending,processing,completed,rejected',
            'admin_notes'      => 'nullable|string',
            'rejection_reason' => 'nullable|string',
            'assigned_to'      => 'nullable|exists:users,id',
        ]);

        $data = $request->only(['status','admin_notes','rejection_reason','assigned_to']);
        if ($request->status === 'completed') $data['completed_at'] = now();

        $req->update($data);
        ActivityLog::record(auth()->id(), 'update_request_status', 'statistical_request', $req->id, ['status' => $req->status]);

        return response()->json(['success' => true, 'data' => $req->fresh()->load('assignedUser')]);
    }
}
