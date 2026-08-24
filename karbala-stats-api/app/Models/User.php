<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasRoles;

    protected $fillable = [
        'name', 'name_ar', 'name_en', 'email', 'password',
        'role', 'avatar', 'is_active', 'login_attempts',
        'locked_until', 'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'locked_until'      => 'datetime',
        'is_active'         => 'boolean',
        'password'          => 'hashed',
    ];

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    public function incrementLoginAttempts(): void
    {
        $this->increment('login_attempts');
        if ($this->login_attempts >= 5) {
            $this->update(['locked_until' => now()->addMinutes(30)]);
        }
    }

    public function resetLoginAttempts(): void
    {
        $this->update(['login_attempts' => 0, 'locked_until' => null, 'last_login_at' => now()]);
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['superadmin', 'admin', 'editor']);
    }

    public function publications()
    {
        return $this->hasMany(Publication::class, 'created_by');
    }

    public function assignedRequests()
    {
        return $this->hasMany(StatisticalRequest::class, 'assigned_to');
    }
}
