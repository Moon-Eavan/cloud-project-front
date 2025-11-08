import { useState } from 'react';
import styled from 'styled-components';
import { useTaskContext } from '../context/TaskContext';
import { TASK_STATUS } from '../types';

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

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 48px;
  flex: 1;
  overflow: hidden;
`;

const Column = styled.div`
  background-color: #fefefe;
  border-radius: 15px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ColumnTitle = styled.h3`
  font-size: 32px;
  font-weight: bold;
  color: #000;
  margin: 0;
`;

const TaskCount = styled.span`
  font-size: 32px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
`;

const TaskList = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

const TaskCard = styled.div`
  background-color: #fefefe;
  border-radius: 15px;
  box-shadow: 0px 4px 10px 3px rgba(217, 217, 217, 0.3);
  padding: 22px 21px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 12px 4px rgba(217, 217, 217, 0.4);
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TaskTitle = styled.h4`
  font-size: 22px;
  font-weight: 500;
  color: ${props => props.$isDone ? 'rgba(0, 0, 0, 0.5)' : '#000'};
  margin: 0;
  text-decoration: ${props => props.$isDone ? 'line-through' : 'none'};
  flex: 1;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:hover {
    color: rgba(0, 0, 0, 0.6);
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 140px;
  z-index: 10;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const MenuItem = styled.div`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(44, 127, 255, 0.1);
  }
`;

const TaskDescription = styled.p`
  font-size: 20px;
  color: ${props => props.$isDone ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)'};
  margin: 0;
  text-decoration: ${props => props.$isDone ? 'line-through' : 'none'};
`;

const TaskIndicator = styled.div`
  position: absolute;
  left: 21px;
  top: 32px;
  width: 8px;
  height: 24px;
  background-color: ${props => props.$color};
  border-radius: 15px;
`;

const TodoView = ({ onViewChange }) => {
  const { getTasksByStatus, updateTaskStatus, openEditTask, openNewTask } = useTaskContext();
  const [openMenuId, setOpenMenuId] = useState(null);

  const todoTasks = getTasksByStatus(TASK_STATUS.TODO);
  const progressTasks = getTasksByStatus(TASK_STATUS.PROGRESS);
  const doneTasks = getTasksByStatus(TASK_STATUS.DONE);

  const handleStatusChange = (taskId, currentStatus) => {
    let newStatus;
    if (currentStatus === TASK_STATUS.TODO) {
      newStatus = TASK_STATUS.PROGRESS;
    } else if (currentStatus === TASK_STATUS.PROGRESS) {
      newStatus = TASK_STATUS.DONE;
    }
    
    if (newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
    setOpenMenuId(null);
  };

  const renderTaskCard = (task) => (
    <TaskCard key={task.id} onClick={() => openEditTask(task)}>
      <TaskIndicator $color={task.color} />
      <TaskHeader>
        <TaskTitle $isDone={task.status === TASK_STATUS.DONE}>
          {task.title}
        </TaskTitle>
        <MenuButton 
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(openMenuId === task.id ? null : task.id);
          }}
        >
          􀍠
          <MenuDropdown $show={openMenuId === task.id}>
            {task.status !== TASK_STATUS.DONE && (
              <MenuItem onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(task.id, task.status);
              }}>
                {task.status === TASK_STATUS.TODO ? 'Progress로 이동' : 'Done으로 이동'}
              </MenuItem>
            )}
            <MenuItem onClick={(e) => {
              e.stopPropagation();
              openEditTask(task);
              setOpenMenuId(null);
            }}>
              수정
            </MenuItem>
          </MenuDropdown>
        </MenuButton>
      </TaskHeader>
      <TaskDescription $isDone={task.status === TASK_STATUS.DONE}>
        {task.description}
      </TaskDescription>
    </TaskCard>
  );

  return (
    <Container onClick={() => setOpenMenuId(null)}>
      <Header>
        <ViewTabs>
          <Tab onClick={() => onViewChange('monthly')}>MONTHLY</Tab>
          <Tab $active>TODO</Tab>
          <Tab onClick={() => onViewChange('gantt')}>GANTT</Tab>
        </ViewTabs>
        <AddButton onClick={openNewTask}>􀁌</AddButton>
      </Header>
      
      <BoardContainer>
        <Column>
          <ColumnHeader>
            <ColumnTitle>Todo</ColumnTitle>
            <TaskCount>{todoTasks.length}</TaskCount>
          </ColumnHeader>
          <TaskList>
            {todoTasks.map(renderTaskCard)}
          </TaskList>
        </Column>
        
        <Column>
          <ColumnHeader>
            <ColumnTitle>Progress</ColumnTitle>
            <TaskCount>{progressTasks.length}</TaskCount>
          </ColumnHeader>
          <TaskList>
            {progressTasks.map(renderTaskCard)}
          </TaskList>
        </Column>
        
        <Column>
          <ColumnHeader>
            <ColumnTitle>Done</ColumnTitle>
            <TaskCount>{doneTasks.length}</TaskCount>
          </ColumnHeader>
          <TaskList>
            {doneTasks.map(renderTaskCard)}
          </TaskList>
        </Column>
      </BoardContainer>
    </Container>
  );
};

export default TodoView;
