<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = ['name_ar','name_en','slug','description_ar','icon','parent_id','display_order','is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('display_order');
    }

    public function publications()
    {
        return $this->hasMany(Publication::class);
    }

    public function indicators()
    {
        return $this->hasMany(Indicator::class);
    }

    public function newsArticles()
    {
        return $this->hasMany(NewsArticle::class);
    }

    public function page()
    {
        return $this->hasOne(CategoryPage::class);
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeRoots($q)
    {
        return $q->whereNull('parent_id');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($m) {
            $m->slug = $m->slug ?: Str::slug($m->name_en ?: $m->name_ar);
        });
    }

    public function getTreeAttribute(): array
    {
        return $this->children->map(fn($c) => array_merge($c->toArray(), ['children' => $c->tree]))->toArray();
    }
}
