import { useState } from 'react';
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
import type { Friend, FriendRequest } from '@/types';

const initialFriends: Friend[] = [
  {
    id: 'friend-1',
    name: '김민수',
    email: 'minsu.kim@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
  {
    id: 'friend-2',
    name: '이지은',
    email: 'jieun.lee@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
  {
    id: 'friend-3',
    name: '박서준',
    email: 'seojun.park@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
];

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');

  const handleSendFriendRequest = () => {
    if (!newFriendEmail.trim()) {
      toast.error('이메일을 입력하세요');
      return;
    }
    toast.success(`${newFriendEmail}에게 친구 요청을 보냈습니다.`);
    setNewFriendEmail('');
    setIsAddDialogOpen(false);
  };

  const handleAcceptRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast.success('친구 요청을 수락했습니다');
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast.success('친구 요청을 거절했습니다');
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    toast.success('친구를 삭제했습니다');
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
              <DialogDescription>이메일로 친구를 추가합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="friend-email">친구 이메일</Label>
                <Input
                  id="friend-email"
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="친구의 이메일을 입력하세요"
                />
              </div>
              <Button onClick={handleSendFriendRequest} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                친구 요청 보내기
              </Button>
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
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-gray-900">친구 요청</p>
                        <p className="text-sm text-slate-500">{new Date(request.createdAt).toLocaleDateString()}</p>
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
            {friends.length === 0 ? (
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
