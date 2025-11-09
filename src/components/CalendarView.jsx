import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTaskContext } from '../context/TaskContext';

const Container = styled.div`
  flex: 1;
  background-color: #f7f8f9;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 48px;
  background-color: #f7f8f9;
`;

const ViewTabs = styled.div`
  display: flex;
  background-color: #ffffff;
  border-radius: 15px;
  padding: 6px;
  gap: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  min-width: 0;
`;

const Tab = styled.button`
  padding: 8px 20px;
  border: none;
  border-radius: 15px;
  background-color: ${props => props.$active ? '#2c7fff' : 'transparent'};
  color: ${props => props.$active ? '#fefefe' : '#000'};
  font-size: clamp(14px, 1.5vw, 18px);
  letter-spacing: clamp(1.4px, 0.15vw, 1.8px);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 6px 16px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 12px;
    font-size: 12px;
  }
  
  &:hover {
    background-color: ${props => props.$active ? '#2c7fff' : 'rgba(44, 127, 255, 0.1)'};
  }
`;

const AddButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 36px;
  border: none;
  background-color: #2c7fff;
  color: #fefefe;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #1a5fd9;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CalendarArea = styled.div`
  flex: 1;
  background-color: #fefefe;
  margin: 0 48px 48px;
  border-radius: 15px 15px 0 0;
  padding: 33px 50px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: center; /* Center the navigation */
  align-items: center;
  margin-bottom: 24px;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 28px;
  color: #333;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const MonthTitle = styled.h2`
  font-size: 32px;
  font-weight: bold;
  color: #000;
  margin: 0;
  min-width: 200px;
  text-align: center;
`;

const WeekDaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
  padding: 0 8px;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 8px 0;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
  height: calc(100vh - 400px);
  min-height: 600px;
`;

const DayCell = styled.div`
  background-color: white;
  padding: 12px;
  position: relative;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const DayNumber = styled.div`
  font-size: 24px;
  font-weight: normal;
  color: ${props => {
    if (props.$isToday) return '#0064ff';
    if (props.$isSunday) return '#ff0707';
    if (props.$isSaturday) return '#0064ff';
    return '#000';
  }};
  margin-bottom: 8px;
  text-align: right;
`;

const TaskItem = styled.div`
  background-color: ${props => props.$color};
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarView = ({ onViewChange }) => {
  const { tasks, openNewTask, openEditTask } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const days = [];
    
    // Previous month days to fill first week
    const prevMonthDays = firstDay;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevMonthYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    // Next month days to fill last week
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentDate]);

  // Get tasks for a specific day
  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= taskStart && date <= taskEnd;
    });
  };

  return (
    <Container>
      <Header>
        <ViewTabs>
          <Tab $active onClick={() => onViewChange('monthly')}>MONTHLY</Tab>
          <Tab onClick={() => onViewChange('todo')}>TODO</Tab>
          <Tab onClick={() => onViewChange('gantt')}>GANTT</Tab>
        </ViewTabs>
        <AddButton onClick={openNewTask}>􀉊</AddButton>
      </Header>
      
      <CalendarArea>
        <CalendarHeader>
          <MonthNav>
            <NavButton onClick={handlePrevMonth}>􀄏</NavButton>
            <MonthTitle>
              {currentDate.getFullYear()}년 {currentDate.toLocaleString('ko-KR', { month: 'long' })}
            </MonthTitle>
            <NavButton onClick={handleNextMonth}>􀄑</NavButton>
          </MonthNav>
        </CalendarHeader>
        
        <WeekDaysRow>
          {weekDays.map(day => (
            <WeekDay key={day}>{day}</WeekDay>
          ))}
        </WeekDaysRow>
        
        <CalendarGrid>
          {calendarData.map((dayData, index) => {
            const dayTasks = getTasksForDay(new Date(dayData.date));
            const isSunday = index % 7 === 0;
            const isSaturday = index % 7 === 6;
            
            return (
              <DayCell key={index}>
                <DayNumber 
                  $isToday={dayData.isToday}
                  $isSunday={isSunday}
                  $isSaturday={isSaturday}
                >
                  {dayData.date.getDate()}
                </DayNumber>
                {dayTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    $color={task.color}
                    onClick={() => openEditTask(task)}
                  >
                    {task.title}
                  </TaskItem>
                ))}
              </DayCell>
            );
          })}
        </CalendarGrid>
      </CalendarArea>
    </Container>
  );
};

export default CalendarView;
