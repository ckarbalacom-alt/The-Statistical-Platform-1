<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'name_ar'            => $this->name_ar,
            'name_en'            => $this->name_en,
            'slug'               => $this->slug,
            'path'               => $this->slug === 'home' ? '/' : '/sections/' . $this->slug,
            'description_ar'     => $this->description_ar,
            'icon'               => $this->icon,
            'parent_id'          => $this->parent_id,
            'display_order'      => $this->display_order,
            'is_active'          => $this->is_active,
            'publications_count' => $this->whenCounted('publications'),
            'indicators_count'   => $this->whenCounted('indicators'),
            'news_articles_count'=> $this->whenCounted('newsArticles'),
            'parent'             => new CategoryResource($this->whenLoaded('parent')),
            'page'               => new CategoryPageResource($this->whenLoaded('page')),
            'children'           => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
