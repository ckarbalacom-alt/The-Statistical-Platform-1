<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Support\Str;

class Publication extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'title_ar','title_en','slug','category_id','description_ar','description_en',
        'cover_image','file_path','file_type','file_size','stat_year','stat_quarter',
        'release_date','is_featured','views_count','downloads_count','status',
        'created_by','published_at',
    ];

    protected $casts = [
        'is_featured'     => 'boolean',
        'release_date'    => 'date',
        'published_at'    => 'datetime',
        'file_size'       => 'integer',
        'views_count'     => 'integer',
        'downloads_count' => 'integer',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
        $this->addMediaCollection('file')->singleFile();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }

    public function scopeFeatured($q)
    {
        return $q->where('is_featured', true);
    }

    public function scopeByYear($q, $y)
    {
        return $q->where('stat_year', $y);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function incrementDownloads(): void
    {
        $this->increment('downloads_count');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($m) {
            if (empty($m->slug)) {
                $base = Str::slug($m->title_en ?: $m->title_ar . '-' . time());
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $base . '-' . $i++;
                }
                $m->slug = $slug;
            }
            if ($m->status === 'published' && !$m->published_at) {
                $m->published_at = now();
            }
            if ($m->status === 'published' && !$m->release_date) {
                $m->release_date = now()->toDateString();
            }
        });

        static::updating(function ($m) {
            if ($m->status === 'published' && !$m->published_at) {
                $m->published_at = now();
            }
            if ($m->status === 'published' && !$m->release_date) {
                $m->release_date = now()->toDateString();
            }
        });
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size ?? 0;
        if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
        if ($bytes >= 1024)    return round($bytes / 1024, 1) . ' KB';
        return $bytes . ' B';
    }
}
