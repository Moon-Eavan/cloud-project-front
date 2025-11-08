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

const CreateButton = styled.button`
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
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1280px;
`;

const GroupCard = styled.div`
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CardTitleSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const CardDescription = styled.p`
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #4a5565;
  letter-spacing: -0.1504px;
  margin: 0;
`;

const MenuButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #364153;
  padding: 0;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.p`
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #62748e;
  letter-spacing: -0.1504px;
  margin: 0;
`;

const MemberList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const MemberBadge = styled.span`
  background: #eceef2;
  border-radius: 8px;
  padding: 3px 9px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #030213;
`;

const EmptyText = styled.p`
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #90a1b9;
  letter-spacing: -0.1504px;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 6px 12px;
  height: 32px;
  font-family: 'SF Pro', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #030213;
  letter-spacing: -0.1504px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: #f9fafb;
  }
`;

const Icon = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
`;

function GroupView() {
  const [groups] = useState([
    {
      id: 1,
      name: '웹개발 스터디',
      description: 'React와 TypeScript 스터디 그룹',
      members: ['홍길동', '김철수', '이영희'],
      scheduleCount: 0
    },
    {
      id: 2,
      name: '프로젝트 팀 A',
      description: '캡스톤 프로젝트 팀',
      members: ['홍길동', '박민수', '최지은', '정수아'],
      scheduleCount: 0
    }
  ]);

  return (
    <Container>
      <Header>
        <Title>그룹</Title>
        <CreateButton>
          <Icon>➕</Icon>
          그룹 생성
        </CreateButton>
      </Header>

      <Content>
        <GroupGrid>
          {groups.map(group => (
            <GroupCard key={group.id}>
              <CardHeader>
                <CardTitleSection>
                  <CardTitle>
                    <Icon>👥</Icon>
                    {group.name}
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardTitleSection>
                <MenuButton>⋮</MenuButton>
              </CardHeader>

              <CardBody>
                <Section>
                  <SectionLabel>멤버 ({group.members.length})</SectionLabel>
                  <MemberList>
                    {group.members.map((member, idx) => (
                      <MemberBadge key={idx}>{member}</MemberBadge>
                    ))}
                  </MemberList>
                </Section>

                <Section>
                  <SectionLabel>일정 ({group.scheduleCount})</SectionLabel>
                  <EmptyText>등록된 일정이 없습니다</EmptyText>
                </Section>

                <ButtonGroup>
                  <ActionButton>
                    <Icon>📅</Icon>
                    일정 추가
                  </ActionButton>
                  <ActionButton>일정 조율</ActionButton>
                </ButtonGroup>
              </CardBody>
            </GroupCard>
          ))}
        </GroupGrid>
      </Content>
    </Container>
  );
}

export default GroupView;
