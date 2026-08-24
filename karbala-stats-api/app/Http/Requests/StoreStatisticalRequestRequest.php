<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStatisticalRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requester_name' => 'required|string|min:3|max:200',
            'requester_email' => 'required|email|max:191',
            'requester_phone' => 'nullable|string|max:30',
            'requester_organization' => 'nullable|string|max:300',
            'request_type' => 'required|in:data,report,consultation,partnership',
            'description' => 'required|string|min:30|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'requester_name.required' => 'الاسم مطلوب',
            'requester_email.required' => 'البريد الإلكتروني مطلوب',
            'requester_email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'request_type.required' => 'نوع الطلب مطلوب',
            'description.required' => 'وصف الطلب مطلوب',
            'description.min' => 'يجب أن لا يقل وصف الطلب عن 30 حرفاً',
        ];
    }
}
