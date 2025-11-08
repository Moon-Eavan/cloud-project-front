import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(148.894deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #f7f8f9;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #101828;
  letter-spacing: -0.3125px;
  margin: 0;
`;

const AddButton = styled.button`
  background: #2b7fff;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 8px 20px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  box-shadow: 0px 10px 15px -3px rgba(43, 127, 255, 0.3), 0px 4px 6px -4px rgba(43, 127, 255, 0.3);
  
  &:hover {
    background: #2470ed;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  justify-content: center;
`;

const CenterWrapper = styled.div`
  width: 100%;
  max-width: 1152px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #101828;
  letter-spacing: -0.3125px;
`;

const RequestItem = styled.div`
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 17px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ececf0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #030213;
  letter-spacing: -0.3125px;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.p`
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #030213;
  letter-spacing: -0.3125px;
  margin: 0;
`;

const UserEmail = styled.p`
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #62748e;
  letter-spacing: -0.1504px;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const AcceptButton = styled.button`
  background: #030213;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  height: 32px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1504px;
  cursor: pointer;
  
  &:hover {
    background: #1a1a2e;
  }
`;

const RejectButton = styled.button`
  background: white;
  color: #030213;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 6px 12px;
  height: 32px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.1504px;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
`;

const FriendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const FriendCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FriendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const AvatarWithStatus = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$isOnline ? '#00c950' : '#90a1b9'};
  border: 2px solid white;
`;

const MenuButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #364153;
  padding: 0;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const StatusBadge = styled.span`
  background: ${props => props.$isOnline ? '#030213' : '#eceef2'};
  color: ${props => props.$isOnline ? 'white' : '#030213'};
  border-radius: 8px;
  padding: 4px 9px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
`;

const Icon = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
`;

function FriendView() {
  const [friendRequests] = useState([
    {
      id: 1,
      name: '최지은',
      email: 'choi@example.com'
    }
  ]);

  const [friends] = useState([
    {
      id: 1,
      name: '김철수',
      email: 'kim@example.com',
      isOnline: true
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      isOnline: false
    },
    {
      id: 3,
      name: '박민수',
      email: 'park@example.com',
      isOnline: true
    }
  ]);

  return (
    <Container>
      <Header>
        <Title>친구</Title>
        <AddButton>
          <Icon>➕</Icon>
          친구 추가
        </AddButton>
      </Header>

      <Content>
        <CenterWrapper>
          <Card>
            <CardTitle>
              <Icon>�</Icon>
              친구 요청 ({friendRequests.length})
            </CardTitle>
            {friendRequests.map(request => (
              <RequestItem key={request.id}>
                <UserInfo>
                  <Avatar>{request.name[0]}</Avatar>
                  <UserDetails>
                    <UserName>{request.name}</UserName>
                    <UserEmail>{request.email}</UserEmail>
                  </UserDetails>
                </UserInfo>
                <ButtonGroup>
                  <AcceptButton>수락</AcceptButton>
                  <RejectButton>거절</RejectButton>
                </ButtonGroup>
              </RequestItem>
            ))}
          </Card>

          <Card>
            <CardTitle>
              <Icon>👥</Icon>
              친구 목록 ({friends.length})
            </CardTitle>
            <FriendGrid>
              {friends.map(friend => (
                <FriendCard key={friend.id}>
                  <FriendHeader>
                    <UserInfo>
                      <AvatarWithStatus>
                        <Avatar>{friend.name[0]}</Avatar>
                        <OnlineIndicator $isOnline={friend.isOnline} />
                      </AvatarWithStatus>
                      <UserDetails>
                        <UserName>{friend.name}</UserName>
                        <UserEmail>{friend.email}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                    <MenuButton>⋮</MenuButton>
                  </FriendHeader>
                  <StatusBadge $isOnline={friend.isOnline}>
                    {friend.isOnline ? '온라인' : '오프라인'}
                  </StatusBadge>
                </FriendCard>
              ))}
            </FriendGrid>
          </Card>
        </CenterWrapper>
      </Content>
    </Container>
  );
}

export default FriendView;
