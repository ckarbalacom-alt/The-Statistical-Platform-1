<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'name_ar'       => $this->name_ar,
            'name_en'       => $this->name_en,
            'email'         => $this->email,
            'role'          => $this->role,
            'is_active'     => $this->is_active,
            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s'),
            'created_at'    => $this->created_at->format('Y-m-d'),
            'avatar_url'    => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'permissions'   => $this->whenLoaded('permissions', fn() => $this->getAllPermissions()->pluck('name')),
        ];
    }
}
