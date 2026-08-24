<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IndicatorDataPoint extends Model
{
    protected $fillable = ['indicator_id','period_type','period_label','period_sort','value','notes'];

    protected $casts = ['value' => 'float'];

    public function indicator()
    {
        return $this->belongsTo(Indicator::class);
    }
}
