<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatisticalRequest extends Model
{
    protected $fillable = [
        'request_code','requester_name','requester_email','requester_phone',
        'requester_organization','request_type','description','status',
        'assigned_to','admin_notes','rejection_reason','completed_at',
    ];

    protected $casts = ['completed_at' => 'datetime'];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public static function generateCode(): string
    {
        $year = date('Y');
        $max  = static::max('id') ?? 0;
        return sprintf('KSR-%s-%04d', $year, $max + 1);
    }

    public static function getStats(): array
    {
        $counts = static::selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        return [
            'total'      => array_sum($counts),
            'pending'    => $counts['pending']    ?? 0,
            'processing' => $counts['processing'] ?? 0,
            'completed'  => $counts['completed']  ?? 0,
            'rejected'   => $counts['rejected']   ?? 0,
            'today'      => static::whereDate('created_at', today())->count(),
        ];
    }
}
