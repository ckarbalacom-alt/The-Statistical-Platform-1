<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryPage extends Model
{
    protected $fillable = [
        'category_id',
        'title_ar',
        'title_en',
        'summary_ar',
        'body_ar',
        'status',
        'is_featured',
        'published_at',
        'author_id',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
