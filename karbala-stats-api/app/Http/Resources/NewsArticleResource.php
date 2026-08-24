<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NewsArticleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'title_ar'      => $this->title_ar,
            'title_en'      => $this->title_en,
            'slug'          => $this->slug,
            'body_ar'       => $this->body_ar,
            'thumbnail_url' => $this->thumbnail ? $request->getSchemeAndHttpHost() . '/storage/' . ltrim($this->thumbnail, '/') : null,
            'article_type'  => $this->article_type,
            'category_id'   => $this->category_id,
            'tags'          => $this->tags,
            'is_featured'   => $this->is_featured,
            'views_count'   => $this->views_count,
            'published_at'  => $this->published_at?->format('Y-m-d H:i:s'),
            'author' => $this->whenLoaded('author', fn() => [
                'id'      => $this->author->id,
                'name_ar' => $this->author->name_ar,
            ]),
            'category' => $this->whenLoaded('category', fn() => [
                'id'      => $this->category->id,
                'name_ar' => $this->category->name_ar,
                'slug'    => $this->category->slug,
                'path'    => $this->category->path,
            ]),
        ];
    }
}
