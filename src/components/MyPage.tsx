import { useState } from 'react';
import { Camera, Key, User, Mail, LogOut, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';

interface ExternalService {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  email?: string;
}

export default function MyPage() {
  const [profile, setProfile] = useState({
    name: '김철수',
    email: 'user@example.com',
    profileImage: '',
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [externalServices, setExternalServices] = useState<ExternalService[]>([
    {
      id: 'google',
      name: '구글 계정',
      icon: 'G',
      color: '#FB2C36',
      connected: false,
    },
    {
      id: 'ecampus',
      name: 'e-Campus',
      icon: 'E',
      color: '#155DFC',
      connected: false,
    },
  ]);

  const [ecampusToken, setEcampusToken] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profileImage: reader.result as string });
        toast.success('프로필 사진이 업데이트되었습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword) {
      toast.error('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('새 비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: 백엔드 연동
    toast.success('비밀번호가 변경되었습니다.');
    setIsPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleGoogleConnect = () => {
    // TODO: OAuth 연동
    setExternalServices(prev =>
      prev.map(service =>
        service.id === 'google'
          ? { ...service, connected: true }
          : service
      )
    );
    toast.success('구글 계정이 연동되었습니다.');
  };

  const handleGoogleDisconnect = () => {
    setExternalServices(prev =>
      prev.map(service =>
        service.id === 'google'
          ? { ...service, connected: false }
          : service
      )
    );
    toast.success('구글 계정 연동이 해제되었습니다.');
  };

  const handleEcampusConnect = () => {
    if (!ecampusToken.trim()) {
      toast.error('Access Token을 입력해주세요.');
      return;
    }

    // TODO: 백엔드 연동
    setExternalServices(prev =>
      prev.map(service =>
        service.id === 'ecampus'
          ? { ...service, connected: true }
          : service
      )
    );
    setEcampusToken('');
    toast.success('e-Campus가 연동되었습니다.');
  };

  const handleEcampusDisconnect = () => {
    setExternalServices(prev =>
      prev.map(service =>
        service.id === 'ecampus'
          ? { ...service, connected: false }
          : service
      )
    );
    toast.success('e-Campus 연동이 해제되었습니다.');
  };

  const handleLogout = () => {
    // TODO: 로그아웃 처리
    toast.success('로그아웃되었습니다.');
  };

  const googleService = externalServices.find(s => s.id === 'google');
  const ecampusService = externalServices.find(s => s.id === 'ecampus');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-normal text-gray-900 mb-6">마이페이지</h1>

      <div className="flex flex-col gap-6">
        {/* Profile Information Card */}
        <Card className="bg-white border border-black/10 rounded-[14px]">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-normal text-gray-900">
              프로필 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <Input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Label>
              </div>

              {/* User Info */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="text-base text-gray-900">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="text-base text-gray-900">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card className="bg-white border border-black/10 rounded-[14px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-normal text-gray-900">
                비밀번호 변경
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="border-black/10 rounded-lg"
              >
                <Key className="w-4 h-4 mr-2" />
                비밀번호 변경
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* External Services Card */}
        <Card className="bg-white border border-black/10 rounded-[14px]">
          <CardHeader>
            <CardTitle className="text-base font-normal text-gray-900">
              외부 서비스 연동
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Service */}
            <div className="border border-black/10 rounded-[10px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-normal"
                    style={{ backgroundColor: googleService?.color }}
                  >
                    {googleService?.icon}
                  </div>
                  <div>
                    <p className="text-base text-gray-900">
                      {googleService?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {googleService?.connected ? '연동됨' : '연동되지 않음'}
                    </p>
                  </div>
                </div>
                {googleService?.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoogleDisconnect}
                    className="border-black/10 rounded-lg"
                  >
                    연동 해제
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoogleConnect}
                    className="border-black/10 rounded-lg"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    연동하기
                  </Button>
                )}
              </div>
            </div>

            {/* e-Campus Service */}
            <div className="border border-black/10 rounded-[10px] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-normal"
                    style={{ backgroundColor: ecampusService?.color }}
                  >
                    {ecampusService?.icon}
                  </div>
                  <div>
                    <p className="text-base text-gray-900">
                      {ecampusService?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ecampusService?.connected ? '연동됨' : '연동되지 않음'}
                    </p>
                  </div>
                </div>
                {ecampusService?.connected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEcampusDisconnect}
                    className="border-black/10 rounded-lg"
                  >
                    연동 해제
                  </Button>
                )}
              </div>

              {!ecampusService?.connected && (
                <div className="space-y-2">
                  <p className="text-base text-gray-900">Access Token</p>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="e-Campus Access Token을 입력하세요"
                        value={ecampusToken}
                        onChange={(e) => setEcampusToken(e.target.value)}
                        className="bg-gray-100 border-transparent rounded-lg"
                      />
                      <p className="text-xs text-gray-500">
                        e-Campus 설정에서 Access Token을 발급받아 입력하세요.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEcampusConnect}
                      className="border-black/10 rounded-lg h-9"
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

        {/* Logout Card */}
        <Card className="bg-white border border-black/10 rounded-[14px]">
          <CardContent className="p-6">
            <Button
              variant="outline"
              className="w-full justify-center border-black/10 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">
              비밀번호 변경
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">현재 비밀번호</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="bg-gray-100 border-transparent rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">새 비밀번호</Label>
              <Input
                type="password"
                placeholder="최소 8자 이상"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="bg-gray-100 border-transparent rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">새 비밀번호 확인</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="bg-gray-100 border-transparent rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePasswordChange}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              비밀번호 변경
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              className="border-black/10 rounded-lg"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
