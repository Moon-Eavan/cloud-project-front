import { useState } from 'react';
import styled from 'styled-components';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import TodoView from './components/TodoView';
import GanttView from './components/GanttView';
import TaskPopup from './components/TaskPopup';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function AppContent() {
  const [activeMenu, setActiveMenu] = useState('일정');
  const [currentView, setCurrentView] = useState('monthly'); // 'monthly', 'todo', 'gantt'
  
  const {
    taskPopupState,
    closeTaskPopup,
    addTask,
    updateTask
  } = useTaskContext();

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleTaskSave = (task) => {
    if (taskPopupState.task?.id) {
      updateTask(taskPopupState.task.id, task);
    } else {
      addTask(task);
    }
    closeTaskPopup();
  };

  // 현재 활성화된 뷰 렌더링
  const renderView = () => {
    // 일정 탭이 아니면 준비 중 메시지
    if (activeMenu !== '일정') {
      return (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '24px',
          color: 'rgba(0, 0, 0, 0.3)'
        }}>
          {activeMenu} 기능 준비 중
        </div>
      );
    }

    // 일정 탭에서는 currentView에 따라 렌더링
    switch (currentView) {
      case 'monthly':
        return <CalendarView onViewChange={handleViewChange} />;
      case 'todo':
        return <TodoView onViewChange={handleViewChange} />;
      case 'gantt':
        return <GanttView onViewChange={handleViewChange} />;
      default:
        return <CalendarView onViewChange={handleViewChange} />;
    }
  };

  return (
    <AppContainer>
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu}
      />
      <MainContent>
        {renderView()}
      </MainContent>
      
      <TaskPopup
        show={taskPopupState.isOpen}
        task={taskPopupState.task}
        onClose={closeTaskPopup}
        onSave={handleTaskSave}
      />
    </AppContainer>
  );
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
