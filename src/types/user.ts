// 사용자 기본 정보
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  ecampusConnected?: boolean;
  googleConnected?: boolean;
}

// 친구 정보
export interface Friend {
  id: string;
  userId: string; // 친구의 User ID
  name: string;
  email: string;
  profileImage?: string;
  status: 'online' | 'offline';
  addedAt: Date;
}

// 친구 추가 요청
export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// 로그인 입력
export interface LoginInput {
  email: string;
  password: string;
}

// 회원가입 입력 (e-campus 기반)
export interface SignupInput {
  ecampusId: string;
  ecampusPassword: string;
  name: string;
  email: string;
  password: string;
}

// 인증 상태
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
