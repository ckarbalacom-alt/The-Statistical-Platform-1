import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/ui/Spinner'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('لم يصل رمز تسجيل الدخول من Google')
      setTimeout(() => navigate('/admin/login?google_error=' + encodeURIComponent('لم يصل رمز تسجيل الدخول من Google'), { replace: true }), 1200)
      return
    }

    localStorage.setItem('auth_token', token)

    authApi.me()
      .then(user => {
        setAuth(user, token)
        navigate('/admin/dashboard', { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
        setError('تعذر إكمال تسجيل الدخول بواسطة Google')
        setTimeout(() => navigate('/admin/login?google_error=' + encodeURIComponent('تعذر إكمال تسجيل الدخول بواسطة Google'), { replace: true }), 1200)
      })
  }, [navigate, searchParams, setAuth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <>
            <div className="flex justify-center mb-4"><Spinner size="lg" /></div>
            <h1 className="font-bold text-gray-900">جاري تسجيل الدخول بواسطة Google...</h1>
          </>
        )}
      </div>
    </div>
  )
}
