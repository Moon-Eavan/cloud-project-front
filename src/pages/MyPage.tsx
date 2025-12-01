import { useState, useEffect } from 'react';
import { Mail, Lock, LogOut, Camera, RefreshCw, BookOpen, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { authApi } from '@/api/authApi';
import { ecampusApi } from '@/api/ecampusApi';
import { enrollmentsApi } from '@/api/enrollmentsApi';
import type { User, Enrollment } from '@/types';

interface MyPageProps {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
  onDataRefresh: () => Promise<void>;
}

export default function MyPage({ user, onLogout, onUserUpdate, onDataRefresh }: MyPageProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [ecampusToken, setEcampusToken] = useState('');
  const [isSyncingCourses, setIsSyncingCourses] = useState(false);
  const [isSyncingAssignments, setIsSyncingAssignments] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

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

  const handleConnectEcampus = async () => {
    if (!ecampusToken.trim()) {
      toast.error('Canvas Access Token을 입력해주세요.');
      return;
    }

    try {
      const response = await ecampusApi.connect(ecampusToken);
      toast.success(response.message);
      onUserUpdate(response.user);
      setEcampusToken(''); // Clear input
    } catch (error: any) {
      toast.error(error.message || 'e-Campus 연동에 실패했습니다.');
    }
  };

  const handleDisconnectEcampus = async () => {
    try {
      const response = await ecampusApi.disconnect();
      toast.success(response.message);
      onUserUpdate(response.user);
    } catch (error: any) {
      toast.error(error.message || 'e-Campus 연동 해제에 실패했습니다.');
    }
  };

  // Load enrollments when user has Canvas token
  useEffect(() => {
    const loadEnrollments = async () => {
      if (user?.ecampusToken) {
        setIsLoadingEnrollments(true);
        try {
          const fetchedEnrollments = await enrollmentsApi.listEnrollments();
          setEnrollments(fetchedEnrollments);
          console.log('[MyPage] Loaded enrollments:', fetchedEnrollments);
        } catch (error: any) {
          console.error('[MyPage] Failed to load enrollments:', error);
          // Don't show error toast on initial load, only if user has token
        } finally {
          setIsLoadingEnrollments(false);
        }
      }
    };

    loadEnrollments();
  }, [user?.ecampusToken]);

  // Step 1: Sync courses from Canvas
  const handleSyncCourses = async () => {
    if (!user?.ecampusToken) {
      toast.error('먼저 Canvas Token을 연동해주세요.');
      return;
    }

    console.log('[MyPage] Starting course sync...');
    setIsSyncingCourses(true);
    try {
      const response = await ecampusApi.syncCanvas('courses');
      console.log('[MyPage] Course sync response:', response);

      if (response.coursesCount === 0) {
        toast.warning('동기화는 완료되었으나 가져온 과목이 없습니다. Canvas 계정에 과목이 있는지 확인해주세요.');
      } else {
        toast.success(response.message);

        // Reload enrollments to show newly synced courses
        const fetchedEnrollments = await enrollmentsApi.listEnrollments();
        setEnrollments(fetchedEnrollments);
        console.log('[MyPage] Reloaded enrollments after course sync:', fetchedEnrollments);
      }
    } catch (error: any) {
      console.error('[MyPage] Course sync error:', error);
      toast.error(error.message || '과목 동기화에 실패했습니다.');
    } finally {
      setIsSyncingCourses(false);
    }
  };

  // Step 2: Sync assignments for enabled courses
  const handleSyncAssignments = async () => {
    if (!user?.ecampusToken) {
      toast.error('먼저 Canvas Token을 연동해주세요.');
      return;
    }

    // Check if there are any enabled enrollments
    const enabledEnrollments = enrollments.filter(e => e.isSyncEnabled);
    if (enabledEnrollments.length === 0) {
      toast.warning('동기화할 과목이 없습니다. 먼저 과목을 활성화해주세요.');
      return;
    }

    console.log('[MyPage] Starting assignment sync for enabled courses...');
    console.log('[MyPage] Enabled enrollments:', enabledEnrollments.map(e => e.course.name));
    setIsSyncingAssignments(true);
    try {
      const response = await ecampusApi.syncCanvas('assignments');
      console.log('[MyPage] Assignment sync response:', response);

      if (response.assignmentsCount === 0) {
        toast.warning('동기화는 완료되었으나 가져온 과제가 없습니다.');
      } else {
        toast.success(response.message);
      }

      // ALWAYS refresh calendars and schedules after sync
      // This will filter out calendars for disabled courses
      console.log('[MyPage] Refreshing calendars and schedules...');
      await onDataRefresh();
      console.log('[MyPage] Data refresh complete - sidebar should now show only enabled courses');
    } catch (error: any) {
      console.error('[MyPage] Assignment sync error:', error);
      toast.error(error.message || '과제 동기화에 실패했습니다.');
    } finally {
      setIsSyncingAssignments(false);
    }
  };

  // Toggle enrollment sync status
  const handleToggleEnrollment = async (enrollmentId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      console.log(`[MyPage] Toggling enrollment ${enrollmentId} to ${newStatus}`);

      const updatedEnrollment = await enrollmentsApi.toggleEnrollmentSync(enrollmentId, newStatus);

      // Update local state
      setEnrollments(prev =>
        prev.map(e => (e.id === enrollmentId ? updatedEnrollment : e))
      );

      if (newStatus) {
        toast.success('과목이 활성화되었습니다.');
      } else {
        toast.success('과목이 비활성화되었습니다. 해당 과목의 모든 일정이 삭제됩니다.');
        // Refresh data to reflect deleted schedules
        await onDataRefresh();
      }
    } catch (error: any) {
      console.error('[MyPage] Toggle enrollment error:', error);
      toast.error(error.message || '과목 설정 변경에 실패했습니다.');
    }
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
                  <User className="w-5 h-5 text-gray-400" />
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
              <div className="flex gap-2">
                {user.ecampusToken && (
                  <Button variant="outline" onClick={handleDisconnectEcampus} size="sm">
                    연동 해제
                  </Button>
                )}
              </div>
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

            {/* 2-Step Canvas Sync UI */}
            {user.ecampusToken && (
              <div className="space-y-4 mt-4 pt-4 border-t">
                {/* Step 1: Sync Courses */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Step 1: 과목 동기화</span>
                    </div>
                    <Button
                      onClick={handleSyncCourses}
                      disabled={isSyncingCourses}
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingCourses ? 'animate-spin' : ''}`} />
                      {isSyncingCourses ? '동기화 중...' : '과목 불러오기'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Canvas에서 수강 중인 과목 목록을 불러옵니다.
                  </p>
                </div>

                {/* Enrollments List */}
                {isLoadingEnrollments ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    과목 목록을 불러오는 중...
                  </div>
                ) : enrollments.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">수강 과목 목록 ({enrollments.length}개)</p>
                    <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-lg">
                      {enrollments.map((enrollment) => (
                        <label
                          key={enrollment.id}
                          className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Checkbox
                              checked={enrollment.isSyncEnabled}
                              onCheckedChange={() => handleToggleEnrollment(enrollment.id, enrollment.isSyncEnabled)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{enrollment.course.name}</p>
                              <p className="text-xs text-gray-500 truncate">{enrollment.course.courseCode}</p>
                            </div>
                          </div>
                          {enrollment.isSyncLeader && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2 shrink-0">
                              리더
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      체크된 과목의 과제만 동기화됩니다. 체크 해제 시 해당 과목의 모든 일정이 삭제됩니다.
                    </p>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">
                    과목 목록이 없습니다. 먼저 "과목 불러오기"를 클릭하세요.
                  </div>
                )}

                {/* Step 2: Sync Assignments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Step 2: 과제 동기화</span>
                    </div>
                    <Button
                      onClick={handleSyncAssignments}
                      disabled={isSyncingAssignments || enrollments.filter(e => e.isSyncEnabled).length === 0}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingAssignments ? 'animate-spin' : ''}`} />
                      {isSyncingAssignments ? '동기화 중...' : '과제 동기화'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    체크된 과목의 과제를 캘린더에 추가합니다.
                  </p>
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
