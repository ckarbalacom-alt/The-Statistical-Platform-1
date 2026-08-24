<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class IndicatorResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'name_ar'           => $this->name_ar,
            'name_en'           => $this->name_en,
            'slug'              => $this->slug,
            'unit_ar'           => $this->unit_ar,
            'unit_en'           => $this->unit_en,
            'source'            => $this->source,
            'methodology_ar'    => $this->methodology_ar,
            'latest_value'      => $this->latest_value,
            'latest_period'     => $this->latest_period,
            'trend'             => $this->trend,
            'change_percentage' => $this->change_percentage,
            'is_featured'       => $this->is_featured,
            'category' => $this->whenLoaded('category', fn() => [
                'id'      => $this->category->id,
                'name_ar' => $this->category->name_ar,
            ]),
            'data_points' => $this->whenLoaded('dataPoints', fn() => $this->dataPoints->map(fn($dp) => [
                'period_label' => $dp->period_label,
                'period_type'  => $dp->period_type,
                'period_sort'  => $dp->period_sort,
                'value'        => $dp->value,
                'notes'        => $dp->notes,
            ])),
        ];
    }
}
