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
  background-color: #fefefe;
`;

const ViewTabs = styled.div`
  display: flex;
  background-color: #fefefe;
  border-radius: 15px;
  padding: 6px;
  gap: 8px;
`;

const Tab = styled.button`
  padding: 12px 28px;
  border: none;
  border-radius: 15px;
  background-color: ${props => props.$active ? '#2c7fff' : 'transparent'};
  color: ${props => props.$active ? '#fefefe' : '#000'};
  font-size: 24px;
  letter-spacing: 2.4px;
  cursor: pointer;
  transition: all 0.2s;
  
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
  font-size: 26px;
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

const GanttContainer = styled.div`
  flex: 1;
  padding: 48px;
  overflow: auto;
`;

const GanttChart = styled.div`
  background-color: #fefefe;
  border-radius: 15px;
  padding: 24px;
  min-width: 1200px;
`;

const TimelineHeader = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

const TaskColumn = styled.div`
  width: 280px;
  min-width: 280px;
  padding-right: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #000;
`;

const DateGrid = styled.div`
  flex: 1;
  display: flex;
`;

const MonthSection = styled.div`
  flex: ${props => props.$days};
  text-align: center;
  border-left: 1px solid #e0e0e0;
`;

const MonthLabel = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #000;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
`;

const DaysRow = styled.div`
  display: flex;
`;

const DayCell = styled.div`
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  padding: 8px 0;
  border-left: 1px solid #f0f0f0;
  
  &:first-child {
    border-left: none;
  }
`;

const TaskRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 60px;
  border-top: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TaskName = styled.div`
  width: 280px;
  min-width: 280px;
  padding-right: 24px;
  font-size: 18px;
  color: #000;
  cursor: pointer;
  
  &:hover {
    color: #2c7fff;
  }
`;

const TaskTimeline = styled.div`
  flex: 1;
  position: relative;
  height: 40px;
`;

const TaskBar = styled.div`
  position: absolute;
  height: 28px;
  background-color: ${props => props.$color};
  border-radius: 6px;
  left: ${props => props.$left}%;
  width: ${props => props.$width}%;
  top: 6px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(0, 0, 0, 0.3);
  font-size: 20px;
`;

const GanttView = ({ onViewChange }) => {
  const { tasks, openEditTask, openNewTask } = useTaskContext();

  const timelineData = useMemo(() => {
    if (tasks.length === 0) return null;

    // 모든 task의 시작일과 종료일 중 최소/최대 찾기
    const dates = tasks.flatMap(task => [
      new Date(task.startDate),
      new Date(task.endDate)
    ]);
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // 시작일을 해당 월의 1일로, 종료일을 해당 월의 마지막 날로 조정
    minDate.setDate(1);
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);
    
    // 월별 정보 계산
    const months = [];
    let currentDate = new Date(minDate);
    let totalDays = 0;
    
    while (currentDate <= maxDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      months.push({
        year,
        month,
        label: `${year}.${String(month + 1).padStart(2, '0')}`,
        days: daysInMonth
      });
      
      totalDays += daysInMonth;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return { minDate, maxDate, months, totalDays };
  }, [tasks]);

  const calculateBarPosition = (task) => {
    if (!timelineData) return { left: 0, width: 0 };
    
    const { minDate, totalDays } = timelineData;
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // 시작일로부터 경과한 일수 계산
    const startOffset = Math.floor((taskStart - minDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
    
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left, width };
  };

  return (
    <Container>
      <Header>
        <ViewTabs>
          <Tab onClick={() => onViewChange('monthly')}>MONTHLY</Tab>
          <Tab onClick={() => onViewChange('todo')}>TODO</Tab>
          <Tab $active>GANTT</Tab>
        </ViewTabs>
        <AddButton onClick={openNewTask}>􀁌</AddButton>
      </Header>
      
      <GanttContainer>
        <GanttChart>
          {!timelineData || tasks.length === 0 ? (
            <EmptyState>
              일정을 추가하여 간트 차트를 시작하세요
            </EmptyState>
          ) : (
            <>
              <TimelineHeader>
                <TaskColumn>일정</TaskColumn>
                <DateGrid>
                  {timelineData.months.map((month, idx) => (
                    <MonthSection key={idx} $days={month.days}>
                      <MonthLabel>{month.label}</MonthLabel>
                      <DaysRow>
                        {Array.from({ length: month.days }, (_, i) => (
                          <DayCell key={i}>{i + 1}</DayCell>
                        ))}
                      </DaysRow>
                    </MonthSection>
                  ))}
                </DateGrid>
              </TimelineHeader>
              
              {tasks.map(task => {
                const { left, width } = calculateBarPosition(task);
                return (
                  <TaskRow key={task.id}>
                    <TaskName onClick={() => openEditTask(task)}>
                      {task.title}
                    </TaskName>
                    <TaskTimeline>
                      <TaskBar
                        $color={task.color}
                        $left={left}
                        $width={width}
                        onClick={() => openEditTask(task)}
                      >
                        {task.title}
                      </TaskBar>
                    </TaskTimeline>
                  </TaskRow>
                );
              })}
            </>
          )}
        </GanttChart>
      </GanttContainer>
    </Container>
  );
};

export default GanttView;
