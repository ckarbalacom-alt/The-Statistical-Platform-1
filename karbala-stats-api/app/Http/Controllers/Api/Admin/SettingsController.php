<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $grouped = Setting::all()
            ->groupBy('group')
            ->map(fn($group) => $group->values());

        return response()->json(['data' => $grouped]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings'   => 'required|array',
            'settings.*' => 'nullable|string|max:5000',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        ActivityLog::record(auth()->id(), 'update_settings');

        return response()->json(['success' => true]);
    }
}
