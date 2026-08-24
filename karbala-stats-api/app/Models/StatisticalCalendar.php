<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatisticalCalendar extends Model
{
    protected $table    = 'statistical_calendar';

    protected $fillable = [
        'title_ar','title_en','release_date','release_time',
        'indicator_category','notes_ar','status','publication_id',
    ];

    protected $casts = ['release_date' => 'date'];

    public function publication()
    {
        return $this->belongsTo(Publication::class);
    }

    public function scopeUpcoming($q, int $days = 30)
    {
        return $q->where('status', 'scheduled')
                 ->whereBetween('release_date', [today(), today()->addDays($days)])
                 ->orderBy('release_date');
    }
}
