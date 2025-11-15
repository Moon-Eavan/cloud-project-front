import { useState, useEffect } from 'react';
import { Plus, UserPlus, UserMinus, Mail, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

import { Friend } from '../../types';
import * as friendApi from '../../api/friendApi';

interface FriendRequest {
  id: string;
  name: string;
  email: string;
}

const initialFriendRequests: FriendRequest[] = [
  {
    id: 'req1',
    name: '최지은',
    email: 'choi@khu.ac.kr',
  },
];

export default function FriendPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const data = await friendApi.getFriends();
    setFriends(data);
  };

  // spec.md 규칙: 상대방의 ID로 친구 추가
  const handleAddFriend = async () => {
    if (!newFriendId.trim()) {
      toast.error('친구 ID를 입력해주세요.');
      return;
    }

    try {
      const friend = await friendApi.addFriend(newFriendId);
      setFriends([...friends, friend]);
      toast.success(`${friend.name}님을 친구로 추가했습니다.`);
      setNewFriendId('');
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '친구 추가에 실패했습니다.');
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      const newFriend: Friend = {
        id: Date.now().toString(),
        userId: `user-${Date.now()}`,
        name: request.name,
        email: request.email,
        status: 'offline',
        addedAt: new Date(),
      };
      setFriends([...friends, newFriend]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
      toast.success(`${request.name}님의 친구 요청을 수락했습니다.`);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    toast.info('친구 요청을 거절했습니다.');
  };

  const handleRemoveFriend = async (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    await friendApi.removeFriend(friendId);
    setFriends(friends.filter(f => f.id !== friendId));
    toast.success(`${friend?.name || '친구'}를 삭제했습니다.`);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-gray-900">친구</h2>
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
              <DialogDescription>친구의 ID를 입력하여 추가합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="friend-id">친구 ID</Label>
                <Input
                  id="friend-id"
                  value={newFriendId}
                  onChange={e => setNewFriendId(e.target.value)}
                  placeholder="친구의 ID를 입력하세요"
                />
              </div>
              <Button onClick={handleAddFriend} className="w-full bg-blue-500 hover:bg-blue-600">
                <UserPlus className="w-4 h-4 mr-2" />
                친구 추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
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
                {friendRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{request.name}</p>
                        <p className="text-sm text-slate-500">{request.email}</p>
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

        <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <UserPlus className="w-5 h-5" />
              친구 목록 ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friend => (
                <Card key={friend.id} className="hover:shadow-xl transition-all bg-white border-gray-200 rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friend.profileImage} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{friend.name}</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
