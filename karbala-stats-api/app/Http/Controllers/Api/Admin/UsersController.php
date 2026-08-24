<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('role'))   $query->where('role', $request->role);
        if ($request->filled('search')) $query->where(function ($q) use ($request) {
            $q->where('name_ar', 'like', '%' . $request->search . '%')
              ->orWhere('email', 'like', '%' . $request->search . '%');
        });

        $perPage = min((int)($request->per_page ?? 15), 50);

        $page = $query->orderByDesc('created_at')->paginate($perPage);
        return response()->json([
            'data'         => UserResource::collection($page->items()),
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
            'name_ar'  => 'required|string|min:3|max:150',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:superadmin,admin,editor,viewer',
        ]);

        $user = User::create([
            'name'     => $request->name_ar,
            'name_ar'  => $request->name_ar,
            'name_en'  => $request->name_en,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'is_active'=> true,
        ]);

        $user->assignRole($request->role);
        ActivityLog::record(auth()->id(), 'create_user', 'user', $user->id);

        return new UserResource($user);
    }

    public function show(int $id)
    {
        return new UserResource(User::findOrFail($id));
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email'    => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role'     => 'sometimes|required|in:superadmin,admin,editor,viewer',
        ]);

        $data = $request->except('password');
        if ($request->filled('password')) $data['password'] = Hash::make($request->password);
        if (isset($data['name_ar']))      $data['name'] = $data['name_ar'];

        $user->update($data);
        if ($request->filled('role')) $user->syncRoles([$request->role]);

        ActivityLog::record(auth()->id(), 'update_user', 'user', $user->id);

        return new UserResource($user->fresh());
    }

    public function destroy(int $id)
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'لا يمكن حذف حسابك الخاص'], 422);
        }
        $user->delete();
        ActivityLog::record(auth()->id(), 'delete_user', 'user', $id);
        return response()->json(['success' => true]);
    }

    public function toggleActive(int $id)
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'لا يمكن تعطيل حسابك الخاص'], 422);
        }
        $user->update(['is_active' => !$user->is_active]);
        return response()->json(['success' => true, 'is_active' => $user->is_active]);
    }
}
