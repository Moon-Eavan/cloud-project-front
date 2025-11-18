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

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export default function SignupDialog({ open, onOpenChange, onSwitchToLogin }: SignupDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    try {
      await signup(name, email, password);
      toast.success('회원가입이 완료되었습니다.');
      onOpenChange(false);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('회원가입에 실패했습니다.');
    }
  };

  const handleSwitchToLogin = () => {
    onOpenChange(false);
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm p-6 w-[90vw] max-w-[360px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              회원가입
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-1">
              새 계정을 만들어 Calendar를 시작하세요
            </p>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                이름
              </label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                이메일
              </label>
              <Input
                id="signup-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <Input
                id="signup-password"
                type="password"
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSignup();
                }}
              />
            </div>

            <div className="pt-2 space-y-2">
              <Button
                onClick={handleSignup}
                className="w-full h-10 text-sm font-medium"
              >
                회원가입
              </Button>

            <div className="text-center text-xs text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={handleSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
