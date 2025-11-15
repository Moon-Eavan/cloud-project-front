import { useState } from 'react';
import { Plus, UserPlus, UserMinus, Mail, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Friend {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  status: 'online' | 'offline';
}

const initialFriendRequests: { id: string; name: string; email: string }[] = [
  {
    id: 'req1',
    name: '최지은',
    email: 'choi@example.com',
  },
];

interface FriendPageProps {
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}

export default function FriendPage({ friends, setFriends }: FriendPageProps) {
  const [friendRequests, setFriendRequests] = useState(initialFriendRequests);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');

  const handleSendFriendRequest = () => {
    if (newFriendEmail.trim()) {
      alert(`${newFriendEmail}에게 친구 요청을 보냈습니다.`);
      setNewFriendEmail('');
      setIsAddDialogOpen(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find((r) => r.id === requestId);
    if (request) {
      setFriends([
        ...friends,
        {
          id: Date.now().toString(),
          name: request.name,
          email: request.email,
          status: 'offline',
        },
      ]);
      setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter((f) => f.id !== friendId));
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
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                      >
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
                          <DropdownMenuItem
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="text-red-600"
                          >
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