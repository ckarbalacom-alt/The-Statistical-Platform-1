<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title_ar'       => 'required|string|min:5|max:500',
            'title_en'       => 'nullable|string|max:500',
            'category_id'    => 'required|exists:categories,id',
            'description_ar' => 'nullable|string',
            'stat_year'      => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'stat_quarter'   => 'nullable|integer|min:1|max:4',
            'release_date'   => 'nullable|date',
            'is_featured'    => 'nullable|boolean',
            'status'         => 'required|in:draft,published,archived',
            'cover_image'    => 'nullable|image|max:5120',
            'file'           => 'nullable|file|mimes:pdf,xlsx,xls,csv|max:51200',
        ];
    }

    public function messages(): array
    {
        return [
            'title_ar.required'    => 'العنوان العربي مطلوب',
            'category_id.required' => 'يجب اختيار التصنيف',
            'category_id.exists'   => 'التصنيف المحدد غير موجود',
        ];
    }
}
