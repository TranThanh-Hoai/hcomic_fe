import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Flame, User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await login({ username: username.trim(), password });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <div className="py-12 sm:py-20 max-w-md mx-auto px-4 animate-fade-in">
      <div className="bg-[#141721] rounded-3xl p-7 sm:p-9 border border-white/5 soft-shadow space-y-6">
        
        {/* Header */}
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>HComic Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Đăng nhập tài khoản
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Đắm chìm vào hàng nghìn tác phẩm truyện tranh đỉnh cao và đồng bộ tiến độ đọc mọi lúc mọi nơi.
          </p>
        </div>

        {/* Google OAuth2 Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-zinc-700 text-zinc-100 text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:scale-[1.01]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-[#141721] px-3 text-zinc-500 font-semibold tracking-wider">
                hoặc bằng tài khoản
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 text-xs bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Traditional Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Tên đăng nhập
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username của bạn..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all"
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 text-xs text-zinc-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-orange-400 hover:text-orange-300 hover:underline">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
};
