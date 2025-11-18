import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'sonner';
import SignupDialog from './SignupDialog';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(email, password);
      toast.success('로그인되었습니다.');
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error('로그인에 실패했습니다.');
    }
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm p-6 w-[90vw] max-w-[360px]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              로그인
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-1">
              Calendar에 오신 것을 환영합니다
            </p>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
              />
            </div>

            <div className="pt-2 space-y-2">
              <Button
                onClick={handleLogin}
                className="w-full h-10 text-sm font-medium"
              >
                로그인
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">또는</span>
                </div>
              </div>

              <Button
                onClick={handleSignupClick}
                variant="outline"
                className="w-full h-10 text-sm font-medium"
              >
                회원가입
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupDialog
        open={showSignup}
        onOpenChange={(open) => {
          setShowSignup(open);
          if (!open && !isAuthenticated) {
            onOpenChange(true);
          }
        }}
        onSwitchToLogin={() => {
          setShowSignup(false);
          onOpenChange(true);
        }}
      />
    </>
  );
}
