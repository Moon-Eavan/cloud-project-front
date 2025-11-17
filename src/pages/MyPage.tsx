import { useState } from 'react';
import { User, Mail, Lock, Link2, LogOut, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  googleConnected: boolean;
  ecampusConnected: boolean;
  ecampusToken?: string;
}

export default function MyPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: '김철수',
    email: 'user@example.com',
    googleConnected: false,
    ecampusConnected: false,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [ecampusToken, setEcampusToken] = useState('');

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // TODO: API 호출
    toast.success('비밀번호가 변경되었습니다.');
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleConnectGoogle = () => {
    // TODO: Google OAuth 구현
    setUserProfile({
      ...userProfile,
      googleConnected: true,
    });
    toast.success('구글 계정이 연동되었습니다.');
  };

  const handleDisconnectGoogle = () => {
    setUserProfile({
      ...userProfile,
      googleConnected: false,
    });
    toast.success('구글 계정 연동이 해제되었습니다.');
  };

  const handleConnectEcampus = () => {
    if (!ecampusToken.trim()) {
      toast.error('Access Token을 입력해주세요.');
      return;
    }

    // TODO: 토큰 검증 API 호출
    setUserProfile({
      ...userProfile,
      ecampusConnected: true,
      ecampusToken: ecampusToken,
    });
    toast.success('e-Campus가 연동되었습니다.');
    setEcampusToken('');
  };

  const handleDisconnectEcampus = () => {
    setUserProfile({
      ...userProfile,
      ecampusConnected: false,
      ecampusToken: undefined,
    });
    toast.success('e-Campus 연동이 해제되었습니다.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile({
          ...userProfile,
          profileImage: reader.result as string,
        });
        toast.success('프로필 이미지가 업데이트되었습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // TODO: 로그아웃 처리
    toast.success('로그아웃되었습니다.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl">마이페이지</h1>

      {/* 프로필 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile.profileImage} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {userProfile.name.charAt(0)}
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
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p>{userProfile.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p>{userProfile.email}</p>
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
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                size="sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                비밀번호 변경
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div>
                <Label htmlFor="current-password" className="text-sm">현재 비밀번호</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-sm">새 비밀번호</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="최소 8자 이상"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-sm">새 비밀번호 확인</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleChangePassword}
                  className="bg-blue-500 hover:bg-blue-600"
                >
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
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                G
              </div>
              <div>
                <p>구글 계정</p>
                <p className="text-sm text-gray-500">
                  {userProfile.googleConnected ? '연동됨' : '연동되지 않음'}
                </p>
              </div>
            </div>
            {userProfile.googleConnected ? (
              <Button variant="outline" onClick={handleDisconnectGoogle}>
                연동 해제
              </Button>
            ) : (
              <Button onClick={handleConnectGoogle} variant="outline">
                <Link2 className="w-4 h-4 mr-2" />
                연동하기
              </Button>
            )}
          </div>

          {/* 이캠퍼스 연동 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  <span className="text-white text-base">E</span>
                </div>
                <div>
                  <p>e-Campus</p>
                  <p className="text-sm text-gray-500">
                    {userProfile.ecampusConnected ? '연동됨' : '연동되지 않음'}
                  </p>
                </div>
              </div>
              {userProfile.ecampusConnected && (
                <Button variant="outline" onClick={handleDisconnectEcampus}>
                  연동 해제
                </Button>
              )}
            </div>

            {!userProfile.ecampusConnected && (
              <div style={{ marginTop: '16px' }}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="ecampus-token"
                      type="text"
                      value={ecampusToken}
                      onChange={e => setEcampusToken(e.target.value)}
                      placeholder="e-Campus Access Token을 입력하세요"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      e-Campus 설정에서 Access Token을 발급받아 입력하세요.
                    </p>
                  </div>
                  <Button
                    onClick={handleConnectEcampus}
                    variant="outline"
                    className="shrink-0"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    연동하기
                  </Button>
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
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
