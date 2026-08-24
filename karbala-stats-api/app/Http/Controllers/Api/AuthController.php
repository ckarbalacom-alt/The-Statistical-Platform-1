<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة'],
            ]);
        }

        if ($user->isLocked()) {
            throw ValidationException::withMessages([
                'email' => ['الحساب مقفل مؤقتاً بسبب محاولات تسجيل دخول متعددة'],
            ]);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            $user->incrementLoginAttempts();
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة'],
            ]);
        }

        $user->resetLoginAttempts();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json($this->tokenResponse($user, $token));
    }

    public function googleRedirect()
    {
        $google = config('services.google');

        if (empty($google['client_id']) || empty($google['client_secret'])) {
            return response()->json([
                'message' => 'تسجيل الدخول بواسطة Google غير مفعّل بعد. أضف GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في ملف .env.',
            ], 503);
        }

        $query = http_build_query([
            'client_id' => $google['client_id'],
            'redirect_uri' => $google['redirect'],
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);

        return response()->json([
            'url' => 'https://accounts.google.com/o/oauth2/v2/auth?' . $query,
        ]);
    }

    public function googleCallback(Request $request)
    {
        $frontendUrl = rtrim(config('services.frontend_url'), '/');
        $loginUrl = $frontendUrl . '/admin/login';

        if ($request->filled('error')) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('تم إلغاء تسجيل الدخول بواسطة Google'));
        }

        if (!$request->filled('code')) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('لم يصل رمز التحقق من Google'));
        }

        $google = config('services.google');
        if (empty($google['client_id']) || empty($google['client_secret'])) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('تسجيل الدخول بواسطة Google غير مفعّل'));
        }

        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $request->code,
            'client_id' => $google['client_id'],
            'client_secret' => $google['client_secret'],
            'redirect_uri' => $google['redirect'],
            'grant_type' => 'authorization_code',
        ]);

        if ($tokenResponse->failed() || !$tokenResponse->json('access_token')) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('تعذر التحقق من حساب Google'));
        }

        $profileResponse = Http::withToken($tokenResponse->json('access_token'))
            ->get('https://openidconnect.googleapis.com/v1/userinfo');

        if ($profileResponse->failed()) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('تعذر جلب بيانات حساب Google'));
        }

        $email = strtolower((string) $profileResponse->json('email'));
        $emailVerified = filter_var($profileResponse->json('email_verified'), FILTER_VALIDATE_BOOLEAN);

        if (!$email || !$emailVerified) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('يجب أن يكون بريد Google مؤكداً'));
        }

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user || !$user->is_active || !$user->isAdmin()) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('هذا البريد غير مخوّل لدخول لوحة التحكم'));
        }

        if ($user->isLocked()) {
            return redirect()->away($loginUrl . '?google_error=' . urlencode('الحساب مقفل مؤقتاً'));
        }

        $user->resetLoginAttempts();
        $token = $user->createToken('google-auth-token')->plainTextToken;

        return redirect()->away($frontendUrl . '/auth/google/callback?token=' . urlencode($token));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'تم تسجيل الخروج بنجاح']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name_ar' => $user->name_ar,
            'name_en' => $user->name_en,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    private function tokenResponse(User $user, string $token): array
    {
        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name_ar' => $user->name_ar,
                'name_en' => $user->name_en,
                'email' => $user->email,
                'role' => $user->role,
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ],
        ];
    }
}
