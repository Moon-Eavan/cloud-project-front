import { useState, useEffect } from 'react';
import { Plus, UserPlus, UserMinus, Mail, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { friendsApi } from '@/api/friendsApi';
import type { Friend, FriendRequest } from '@/types';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load friends and friend requests on mount
  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      setIsLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        friendsApi.listFriends(),
        friendsApi.getPendingRequests(),
      ]);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (error: any) {
      console.error('친구 데이터 로드 실패:', error);
      toast.error(error.message || '친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      toast.error('검색어를 입력하세요');
      return;
    }

    try {
      setIsSearching(true);
      const results = await friendsApi.searchUsers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info('검색 결과가 없습니다.');
      }
    } catch (error: any) {
      console.error('사용자 검색 실패:', error);
      toast.error(error.message || '사용자 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (cognitoSub: string) => {
    try {
      await friendsApi.sendFriendRequest(cognitoSub);
      toast.success('친구 요청을 보냈습니다.');
      setSearchResults([]);
      setSearchQuery('');
      setIsAddDialogOpen(false);
      // Notification will be automatically created by NotificationPanel
      // when the recipient checks their pending requests
    } catch (error: any) {
      console.error('친구 요청 전송 실패:', error);
      toast.error(error.message || '친구 요청 전송에 실패했습니다.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsApi.acceptFriendRequest(requestId);
      toast.success('친구 요청을 수락했습니다');
      // Reload friends data to reflect changes
      await loadFriendsData();
    } catch (error: any) {
      console.error('친구 요청 수락 실패:', error);
      toast.error(error.message || '친구 요청 수락에 실패했습니다.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsApi.rejectFriendRequest(requestId);
      toast.success('친구 요청을 거절했습니다');
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error: any) {
      console.error('친구 요청 거절 실패:', error);
      toast.error(error.message || '친구 요청 거절에 실패했습니다.');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await friendsApi.removeFriend(friendId);
      toast.success('친구를 삭제했습니다');
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch (error: any) {
      console.error('친구 삭제 실패:', error);
      toast.error(error.message || '친구 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">친구</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              친구 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>친구 추가</DialogTitle>
              <DialogDescription>이메일 또는 이름으로 사용자를 검색합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search-query">검색</Label>
                  <Input
                    id="search-query"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                    placeholder="이메일 또는 이름으로 검색"
                  />
                </div>
              </div>
              <Button onClick={handleSearchUsers} disabled={isSearching} className="w-full">
                {isSearching ? '검색 중...' : '검색'}
              </Button>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
                  <Label>검색 결과</Label>
                  {searchResults.map((user) => (
                    <div
                      key={user.cognitoSub}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      {user.isFriend ? (
                        <Button size="sm" variant="outline" disabled>
                          이미 친구
                        </Button>
                      ) : user.isPending ? (
                        <Button size="sm" variant="outline" disabled>
                          요청 대기 중
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleSendFriendRequest(user.cognitoSub)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          친구 요청
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Mail className="w-5 h-5" />
                친구 요청 ({friendRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{request.fromUserName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{request.fromUserName || '알 수 없음'}</p>
                        <p className="text-sm text-slate-500">{request.fromUserEmail || ''}</p>
                        <p className="text-xs text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                        수락
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <UserPlus className="w-5 h-5" />
              친구 목록 ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>로딩 중...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>친구가 없습니다</p>
                <p className="text-sm mt-2">친구를 추가해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <Card key={friend.id} className="hover:shadow-xl transition-all bg-white border-gray-200 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.profileImage} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{friend.name}</p>
                            <p className="text-sm text-slate-500">{friend.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRemoveFriend(friend.id)} className="text-red-600">
                              <UserMinus className="w-4 h-4 mr-2" />
                              친구 삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
