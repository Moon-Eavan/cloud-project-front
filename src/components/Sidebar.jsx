import styled from 'styled-components';
import personIcon from '../assets/icons/person.2.fill.svg';
import listIcon from '../assets/icons/list.bullet.indent.svg';

const SidebarContainer = styled.div`
  width: 440px;
  height: 100vh;
  background-color: #fefefe;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  height: 98px;
  display: flex;
  align-items: center;
  padding: 0 45px;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 3.2px;
  color: #000;
  margin: 0;
`;

const MenuList = styled.div`
  padding: 48px 0;
`;

const MenuItem = styled.button`
  width: 360px;
  height: 64px;
  margin: 0 40px 8px;
  border: none;
  border-radius: 15px;
  background-color: ${props => props.$active ? '#2c7fff' : 'transparent'};
  display: flex;
  align-items: center;
  padding: 0 37px 0 37px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0px 4px 10px 4px rgba(44, 127, 255, 0.15)' : 'none'};

  &:hover {
    background-color: ${props => props.$active ? '#2c7fff' : 'rgba(44, 127, 255, 0.05)'};
  }
`;

const MenuIcon = styled.span`
  font-size: 24px;
  color: ${props => props.$active ? '#fefefe' : '#000'};
  margin-right: 12px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuIconImage = styled.img`
  width: 24px;
  height: 24px;
  filter: ${props => props.$active ? 'brightness(0) invert(1)' : 'none'};
`;

const MenuText = styled.span`
  font-size: 24px;
  color: ${props => props.$active ? '#fefefe' : '#000'};
  letter-spacing: 2.4px;
`;

const Footer = styled.div`
  margin-top: auto;
  padding: 48px 40px;
`;

const SmallCalendar = styled.div`
  background-color: transparent;
  padding: 10px;
  margin-bottom: 32px;
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }
  
  .calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-size: 10px;
    color: #333;
    border-radius: 99px;
    cursor: pointer;
    
    &.header {
      color: rgba(51, 51, 51, 0.7);
      font-weight: 500;
      cursor: default;
    }
    
    &.selected {
      background-color: #0c41ff;
      color: white;
    }
    
    &.other-month {
      opacity: 0.3;
    }
    
    &:hover:not(.header):not(.selected) {
      background-color: rgba(12, 65, 255, 0.1);
    }
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0 0 32px 0;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 17px;
`;

const UserAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 18px;
  color: #000;
  margin-bottom: 4px;
`;

const UserEmail = styled.a`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const menuItems = [
  { id: '일정', icon: listIcon, text: '일정', type: 'image' },
  { id: '그룹', icon: '􂕝', text: '그룹', type: 'text' },
  { id: '친구', icon: personIcon, text: '친구', type: 'image' }
];

const Sidebar = ({ activeMenu, onMenuChange }) => {
  // Simple calendar data (current month)
  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isOtherMonth: true });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        isOtherMonth: false,
        isToday: i === today.getDate()
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isOtherMonth: true });
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ['s', 'm', 't', 'w', 't', 'f', 's'];

  return (
    <SidebarContainer>
      <Header>
        <Title>CALENDAR</Title>
      </Header>
      
      <MenuList>
        {menuItems.map(item => (
          <MenuItem
            key={item.id}
            $active={activeMenu === item.id}
            onClick={() => onMenuChange(item.id)}
          >
            <MenuIcon $active={activeMenu === item.id}>
              {item.type === 'image' ? (
                <MenuIconImage src={item.icon} alt={item.text} $active={activeMenu === item.id} />
              ) : (
                item.icon
              )}
            </MenuIcon>
            <MenuText $active={activeMenu === item.id}>{item.text}</MenuText>
          </MenuItem>
        ))}
      </MenuList>
      
      <Footer>
        <SmallCalendar>
          <div className="calendar-grid">
            {weekDays.map((day, index) => (
              <div key={`header-${index}`} className="calendar-day header">
                {day}
              </div>
            ))}
            {days.map((dayObj, index) => (
              <div
                key={index}
                className={`calendar-day ${dayObj.isOtherMonth ? 'other-month' : ''} ${dayObj.isToday ? 'selected' : ''}`}
              >
                {dayObj.day < 10 ? `0${dayObj.day}` : dayObj.day}
              </div>
            ))}
          </div>
        </SmallCalendar>
        
        <Divider />
        
        <UserProfile>
          <UserAvatar src="https://via.placeholder.com/52" alt="User" />
          <UserInfo>
            <UserName>User</UserName>
            <UserEmail href="mailto:cloud@khu.ac.kr">cloud@khu.ac.kr</UserEmail>
          </UserInfo>
        </UserProfile>
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;
