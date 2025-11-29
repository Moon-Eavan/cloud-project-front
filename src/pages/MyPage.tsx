import { useState, useEffect } from 'react';
import { Mail, Lock, LogOut, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { authApi } from '@/api/authApi';
import type { User } from '@/types';

interface MyPageProps {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

export default function MyPage({ user, onLogout, onUserUpdate }: MyPageProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [ecampusToken, setEcampusToken] = useState('');

  // Initialize user data from props
  useEffect(() => {
    if (!user) {
      // If no user, redirect to login (this shouldn't happen as App.tsx handles it)
      toast.error('사용자 정보를 불러올 수 없습니다.');
    }
  }, [user]);

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success('비밀번호가 변경되었습니다.');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleConnectGoogle = () => {
    // TODO: Google OAuth implementation
    // For now, just show a toast
    toast.info('Google Calendar 연동 기능은 곧 지원될 예정입니다.');
  };

  const handleDisconnectGoogle = () => {
    // TODO: Disconnect Google account
    toast.success('Google 계정 연동이 해제되었습니다.');
  };

  const handleConnectEcampus = () => {
    if (!ecampusToken.trim()) {
      toast.error('Access Token을 입력해주세요.');
      return;
    }

    // TODO: Implement E-Campus connection
    toast.info('e-Campus 연동 기능은 곧 지원될 예정입니다.');
  };

  const handleDisconnectEcampus = () => {
    // TODO: Disconnect E-Campus
    toast.success('e-Campus 연동이 해제되었습니다.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Upload file to server and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const profileImage = reader.result as string;
        // Update user profile with new image
        if (user) {
          const updatedUser = { ...user, profileImage };
          onUserUpdate(updatedUser);
          toast.success('프로필 이미지가 업데이트되었습니다.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {/* 프로필 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="flex-1 pl-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>비밀번호 변경</CardTitle>
            {!isChangingPassword && (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                비밀번호 변경
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="pt-3">
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">현재 비밀번호</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="최소 8자 이상"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} className="bg-blue-500 hover:bg-blue-600">
                  비밀번호 변경
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 외부 서비스 연동 */}
      <Card>
        <CardHeader>
          <CardTitle>외부 서비스 연동</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 구글 연동 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                G
              </div>
              <div>
                <p className="font-medium">Google Calendar</p>
                <p className="text-sm text-gray-500">
                  {user.googleConnected ? '연동됨' : '연동되지 않음'}
                </p>
              </div>
            </div>
            {user.googleConnected ? (
              <Button variant="outline" onClick={handleDisconnectGoogle} size="sm">
                연동 해제
              </Button>
            ) : (
              <Button onClick={handleConnectGoogle} variant="outline" size="sm">
                연동하기
              </Button>
            )}
          </div>

          {/* 이캠퍼스 연동 */}
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  E
                </div>
                <div>
                  <p className="font-medium">e-Campus (Canvas LMS)</p>
                  <p className="text-sm text-gray-500">
                    {user.ecampusToken ? '연동됨' : '연동되지 않음'}
                  </p>
                </div>
              </div>
              {user.ecampusToken && (
                <Button variant="outline" onClick={handleDisconnectEcampus} size="sm">
                  연동 해제
                </Button>
              )}
            </div>

            {!user.ecampusToken && (
              <div className="space-y-3 mt-6">
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="ecampus-token"
                        type="text"
                        value={ecampusToken}
                        onChange={(e) => setEcampusToken(e.target.value)}
                        placeholder="Canvas API Access Token을 입력하세요"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Canvas LMS 설정에서 Access Token을 발급받아 입력하세요.
                      </p>
                    </div>
                    <Button
                      onClick={handleConnectEcampus}
                      variant="outline"
                      className="shrink-0"
                    >
                      연동하기
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 로그아웃 */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
