<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStatisticalRequestRequest;
use App\Models\StatisticalRequest;
use Illuminate\Http\Request;

class StatisticalRequestsController extends Controller
{
    public function store(StoreStatisticalRequestRequest $request)
    {
        $data = $request->validated();
        $data['request_code'] = StatisticalRequest::generateCode();
        $data['status']       = 'pending';

        $req = StatisticalRequest::create($data);

        return response()->json([
            'success'      => true,
            'message'      => 'تم إرسال طلبكم بنجاح. سيتم التواصل معكم قريباً.',
            'request_code' => $req->request_code,
        ], 201);
    }
}
