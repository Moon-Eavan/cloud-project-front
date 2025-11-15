import { Friend } from '../types';

// Mock 데이터 저장소
let mockFriends: Friend[] = [
  {
    id: '1',
    userId: 'user-1',
    name: '김철수',
    email: 'kim@khu.ac.kr',
    status: 'online',
    addedAt: new Date(2025, 9, 1),
  },
  {
    id: '2',
    userId: 'user-2',
    name: '이영희',
    email: 'lee@khu.ac.kr',
    status: 'offline',
    addedAt: new Date(2025, 9, 15),
  },
  {
    id: '3',
    userId: 'user-3',
    name: '박민수',
    email: 'park@khu.ac.kr',
    status: 'online',
    addedAt: new Date(2025, 10, 1),
  },
];

// 친구 목록 조회
export async function getFriends(): Promise<Friend[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/friends');
  // return response.data;

  return Promise.resolve([...mockFriends]);
}

// 친구 추가 (ID로 검색)
// spec.md 규칙: 상대방의 ID로 친구 추가
export async function addFriend(userId: string): Promise<Friend> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post('/friends', { userId });
  // return response.data;

  // Mock: userId로 가상의 사용자 정보 생성
  const newFriend: Friend = {
    id: Date.now().toString(),
    userId: userId,
    name: `사용자 ${userId}`,
    email: `${userId}@khu.ac.kr`,
    status: 'offline',
    addedAt: new Date(),
  };

  // 이미 친구인지 확인
  const exists = mockFriends.some((f) => f.userId === userId);
  if (exists) {
    throw new Error('이미 친구로 추가된 사용자입니다.');
  }

  mockFriends.push(newFriend);
  return Promise.resolve(newFriend);
}

// 친구 삭제
export async function removeFriend(friendId: string): Promise<void> {
  // TODO: axios로 실제 API 호출
  // await apiClient.delete(`/friends/${friendId}`);

  mockFriends = mockFriends.filter((f) => f.id !== friendId);
  return Promise.resolve();
}

// 친구 검색 (이름 또는 이메일로)
export async function searchFriends(query: string): Promise<Friend[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/friends/search', { params: { q: query } });
  // return response.data;

  const lowerQuery = query.toLowerCase();
  return Promise.resolve(
    mockFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.email.toLowerCase().includes(lowerQuery)
    )
  );
}

// Mock 데이터 초기화 (테스트용)
export function resetMockFriends(): void {
  mockFriends = [
    {
      id: '1',
      userId: 'user-1',
      name: '김철수',
      email: 'kim@khu.ac.kr',
      status: 'online',
      addedAt: new Date(2025, 9, 1),
    },
    {
      id: '2',
      userId: 'user-2',
      name: '이영희',
      email: 'lee@khu.ac.kr',
      status: 'offline',
      addedAt: new Date(2025, 9, 15),
    },
    {
      id: '3',
      userId: 'user-3',
      name: '박민수',
      email: 'park@khu.ac.kr',
      status: 'online',
      addedAt: new Date(2025, 10, 1),
    },
  ];
}
