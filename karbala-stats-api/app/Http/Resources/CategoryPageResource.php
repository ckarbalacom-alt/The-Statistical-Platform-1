<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryPageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'title_ar' => $this->title_ar,
            'title_en' => $this->title_en,
            'summary_ar' => $this->summary_ar,
            'body_ar' => $this->body_ar,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->format('Y-m-d H:i:s'),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author?->id,
                'name_ar' => $this->author?->name_ar,
            ]),
        ];
    }
}
