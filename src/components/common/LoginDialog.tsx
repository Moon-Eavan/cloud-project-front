import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (name: string, email: string) => void;
}

export default function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // SignUp form
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      onLogin('User', loginEmail);
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpName && signUpEmail && signUpPassword && signUpConfirmPassword) {
      if (signUpPassword !== signUpConfirmPassword) {
        setPasswordMatch(false);
        return;
      }
      setPasswordMatch(true);
      onLogin(signUpName, signUpEmail);
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
    }
  };

  // Email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignUpEmail(value);
    if (value.includes('@')) {
      setEmailValid(true);
    } else if (value.length > 0) {
      setEmailValid(false);
    } else {
      setEmailValid(null);
    }
  };

  // Password validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignUpPassword(value);
    if (value.length >= 8) {
      setPasswordValid(true);
    } else if (value.length > 0) {
      setPasswordValid(false);
    } else {
      setPasswordValid(null);
    }
  };

  // Password match validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignUpConfirmPassword(value);
    if (value === signUpPassword && value.length > 0) {
      setPasswordMatch(true);
    } else if (value.length > 0) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] p-0 overflow-hidden bg-white rounded-[15px] border border-black/15"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>
            {isSignUp ? '회원가입' : '로그인'}
          </DialogTitle>
          <DialogDescription>
            {isSignUp ? '새 계정을 만들어 시작하세요' : '계정에 로그인하세요'}
          </DialogDescription>
        </VisuallyHidden>

        <div className="relative">
          {!isSignUp ? (
            // Login Form
            <form onSubmit={handleLogin} className="px-7 py-10">
              {/* Title */}
              <h2 className="text-[20px] text-center text-black mb-8">
                로그인
              </h2>

              {/* Email Field */}
              <div className="mb-4">
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-[50px] bg-[rgba(217,217,217,0.2)] border-0 rounded-[15px] text-[18px] placeholder:text-[rgba(0,0,0,0.3)] focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-[50px] bg-[rgba(217,217,217,0.2)] border-0 rounded-[15px] text-[18px] placeholder:text-[rgba(0,0,0,0.3)] focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>

              {/* Sign Up Button (outlined) */}
              <Button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="w-full h-[44px] bg-white hover:bg-gray-50 text-[#2c7fff] text-[18px] rounded-[15px] border border-[#2c7fff] mb-3 shadow-none"
              >
                회원가입
              </Button>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-[44px] bg-[#2c7fff] hover:bg-[#2569e6] text-white text-[18px] rounded-[15px] shadow-none"
              >
                로그인
              </Button>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} className="px-7 py-10">
              {/* Title */}
              <h2 className="text-[20px] text-center text-black mb-8">
                회원가입
              </h2>

              {/* Name Field */}
              <div className="mb-5">
                <label className="block text-[16px] text-black mb-2">
                  이름
                </label>
                <Input
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="h-[50px] bg-[rgba(217,217,217,0.2)] border-0 rounded-[15px] text-[18px] placeholder:text-[rgba(0,0,0,0.3)] focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="mb-5">
                <label className="block text-[16px] text-black mb-2">
                  이메일
                </label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={signUpEmail}
                  onChange={handleEmailChange}
                  className="h-[50px] bg-[rgba(217,217,217,0.2)] border-0 rounded-[15px] text-[18px] placeholder:text-[rgba(0,0,0,0.3)] focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
                {emailValid === true && (
                  <p className="text-[#24b400] text-[12px] mt-1">
                    사용 가능한 이메일입니다.
                  </p>
                )}
                {emailValid === false && (
                  <p className="text-[#ff0707] text-[12px] mt-1">
                    유효한 이메일을 입력하세요.
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label className="block text-[16px] text-black mb-2">
                  비밀번호
                </label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={signUpPassword}
                  onChange={handlePasswordChange}
                  className="h-[50px] bg-[rgba(217,217,217,0.2)] border-0 rounded-[15px] text-[18px] placeholder:text-[rgba(0,0,0,0.3)] focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
                {passwordValid === true && (
                  <p className="text-[#24b400] text-[12px] mt-1">
                    사용 가능한 비밀번호입니다.
                  </p>
                )}
                {passwordValid === false && (
                  <p className="text-[#ff0707] text-[12px] mt-1">
                    비밀번호는 최소 8자 이상이어야 합니다.
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-6">
                <label className="block text-[16px] text-black mb-2">
                  비밀번호 확인
                </label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={signUpConfirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="h-[50px] bg-[rgba(217,217,217,0.2)] border-0 rounded-[15px] text-[18px] placeholder:text-[rgba(0,0,0,0.3)] focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
                {passwordMatch === false && (
                  <p className="text-[#ff0707] text-[12px] mt-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
                {passwordMatch === true && (
                  <p className="text-[#24b400] text-[12px] mt-1">
                    비밀번호가 일치합니다.
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full h-[44px] bg-[#2c7fff] hover:bg-[#2569e6] text-white text-[18px] rounded-[15px] shadow-none mb-3"
              >
                회원가입
              </Button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-[#2c7fff] transition-colors"
              >
                이미 계정이 있으신가요? <span className="text-[#2c7fff]">로그인</span>
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
