<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'title_ar'            => $this->title_ar,
            'title_en'            => $this->title_en,
            'slug'                => $this->slug,
            'description_ar'      => $this->description_ar,
            'description_en'      => $this->description_en,
            'cover_image_url'     => $this->cover_image ? asset('storage/' . $this->cover_image) : null,
            'file_url'            => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'file_type'           => $this->file_type,
            'file_size'           => $this->file_size,
            'file_size_formatted' => $this->file_size_formatted,
            'stat_year'           => $this->stat_year,
            'stat_quarter'        => $this->stat_quarter,
            'release_date'        => $this->release_date?->format('Y-m-d'),
            'is_featured'         => $this->is_featured,
            'views_count'         => $this->views_count,
            'downloads_count'     => $this->downloads_count,
            'status'              => $this->status,
            'published_at'        => $this->published_at?->format('Y-m-d H:i:s'),
            'created_at'          => $this->created_at->format('Y-m-d H:i:s'),
            'category' => $this->whenLoaded('category', fn() => [
                'id'      => $this->category->id,
                'name_ar' => $this->category->name_ar,
                'name_en' => $this->category->name_en,
                'slug'    => $this->category->slug,
            ]),
            'creator' => $this->whenLoaded('creator', fn() => [
                'id'      => $this->creator->id,
                'name_ar' => $this->creator->name_ar,
            ]),
        ];
    }
}
