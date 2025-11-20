import { useState } from 'react';
import { User, Mail, Lock, Link2, LogOut, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface MyPageProps {
  onLogout?: () => void;
}

export default function MyPage({ onLogout }: MyPageProps) {
  // Mock user data - 실제로는 API에서 가져와야 함
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

    // 실제로는 API 호출
    toast.success('비밀번호가 변경되었습니다.');
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleConnectGoogle = () => {
    // Google OAuth 플로우 시작
    // 실제 구현시 Google Cloud Console에서 OAuth 클라이언트 ID 발급 필요
    
    const googleOAuthConfig = {
      clientId: 'YOUR_GOOGLE_CLIENT_ID', // Google Cloud Console에서 발급
      redirectUri: window.location.origin + '/auth/google/callback', // OAuth 리다이렉트 URI
      scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      responseType: 'code',
      accessType: 'offline',
      prompt: 'consent',
    };

    // OAuth URL 생성
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleOAuthConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(googleOAuthConfig.redirectUri)}&` +
      `response_type=${googleOAuthConfig.responseType}&` +
      `scope=${encodeURIComponent(googleOAuthConfig.scope)}&` +
      `access_type=${googleOAuthConfig.accessType}&` +
      `prompt=${googleOAuthConfig.prompt}`;

    // 팝업 윈도우로 OAuth 진행
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      oauthUrl,
      'Google OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // 팝업에서 메시지 받기 (실제로는 리다이렉트 URL에서 처리)
    window.addEventListener('message', (event) => {
      // 보안: origin 체크
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'google-oauth-success') {
        popup?.close();
        // 백엔드로 authorization code 전송하여 access token 교환
        // 성공 후 사용자 계정에 구글 계정 연결
        setUserProfile({
          ...userProfile,
          googleConnected: true,
        });
        toast.success('구글 계정이 연동되었습니다.');
      } else if (event.data.type === 'google-oauth-error') {
        popup?.close();
        toast.error('구글 계정 연동에 실패했습니다.');
      }
    });

    // Mock: 개발 환경에서 테스트용
    // 실제 배포시에는 이 부분 제거
    toast.info('구글 OAuth 팝업이 열립니다. (개발 환경에서는 시뮬레이션)');
    setTimeout(() => {
      setUserProfile({
        ...userProfile,
        googleConnected: true,
      });
      toast.success('구글 계정이 연동되었습니다. (시뮬레이션)');
    }, 2000);
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

    // 실제로는 토큰 검증 API 호출
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
      // 실제로는 파일을 서버에 업로드하고 URL을 받아와야 함
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl">마이페이지</h1>

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
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  E
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
              <div className="space-y-3 mt-6">
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="ecampus-token"
                        type="text"
                        value={ecampusToken}
                        onChange={(e) => setEcampusToken(e.target.value)}
                        placeholder="e-Campus Access Token을 입력하세요"
                      />
                      <p className="text-xs text-gray-500 mt-1">
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