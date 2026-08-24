<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Indicator extends Model
{
    protected $fillable = [
        'name_ar','name_en','slug','category_id','unit_ar','unit_en','source',
        'methodology_ar','latest_value','latest_period','trend','change_percentage',
        'is_featured','is_active',
    ];

    protected $casts = [
        'is_featured'       => 'boolean',
        'is_active'         => 'boolean',
        'latest_value'      => 'float',
        'change_percentage' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function dataPoints()
    {
        return $this->hasMany(IndicatorDataPoint::class)->orderBy('period_sort');
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeFeatured($q)
    {
        return $q->where('is_featured', true);
    }

    public function updateLatestStats(): void
    {
        $latest = $this->dataPoints()->orderByDesc('period_sort')->first();
        $prev   = $this->dataPoints()->orderByDesc('period_sort')->skip(1)->first();

        if (!$latest) return;

        $change = 0;
        $trend  = 'stable';
        if ($prev && $prev->value != 0) {
            $change = (($latest->value - $prev->value) / abs($prev->value)) * 100;
            $trend  = $change > 0.5 ? 'up' : ($change < -0.5 ? 'down' : 'stable');
        }

        $this->update([
            'latest_value'      => $latest->value,
            'latest_period'     => $latest->period_label,
            'trend'             => $trend,
            'change_percentage' => round($change, 2),
        ]);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($m) {
            $m->slug = $m->slug ?: Str::slug($m->name_en ?: $m->name_ar . '-' . time());
        });
    }
}
