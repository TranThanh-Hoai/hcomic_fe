import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const OAuth2RedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || '';

    if (!token) {
      setStatus('error');
      setErrorMessage('Không nhận được mã xác thực (token) từ máy chủ Google.');
      return;
    }

    try {
      setSession(token, refreshToken);
      setStatus('success');
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 800);
      return () => clearTimeout(timer);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Lỗi khi lưu phiên đăng nhập OAuth2.');
    }
  }, [searchParams, setSession, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#141721] border border-white/5 text-center space-y-4 soft-shadow">
        {status === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mx-auto flex items-center justify-center text-orange-500">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Đang xác thực Google...</h2>
            <p className="text-xs text-zinc-400">
              Hệ thống đang hoàn tất đăng nhập và thiết lập phiên làm việc an toàn của bạn.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Đăng Nhập Thành Công!</h2>
            <p className="text-xs text-zinc-400">Đang chuyển bạn về trang chủ HComic...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Xác Thực Thất Bại</h2>
            <p className="text-xs text-red-300">{errorMessage}</p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors"
              >
                Quay lại màn Đăng Nhập
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
