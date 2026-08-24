<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table    = 'activity_log';

    protected $fillable = ['user_id','action','target_type','target_id','details','ip_address'];

    protected $casts = ['details' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(int $userId, string $action, string $targetType = '', int $targetId = 0, array $details = []): void
    {
        static::create([
            'user_id'     => $userId,
            'action'      => $action,
            'target_type' => $targetType,
            'target_id'   => $targetId,
            'details'     => $details,
            'ip_address'  => request()->ip(),
        ]);
    }
}
