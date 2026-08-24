<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class NewsArticle extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title_ar','title_en','slug','body_ar','body_en','thumbnail',
        'author_id','category_id','article_type','tags','is_featured','views_count','published_at',
    ];

    protected $casts = [
        'tags'         => 'array',
        'is_featured'  => 'boolean',
        'published_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopePublished($q)
    {
        return $q->where('published_at', '<=', now());
    }

    public function scopeFeatured($q)
    {
        return $q->where('is_featured', true);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($m) {
            if (empty($m->slug)) {
                $base = Str::slug($m->title_en ?: 'article') . '-' . time();
                $m->slug = $base;
            }
        });
    }
}
