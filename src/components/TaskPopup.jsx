import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TASK_STATUS, TASK_COLORS } from '../types';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-center;
  z-index: 1000;
`;

const PopupContainer = styled.div`
  width: 440px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
  padding: 26px 32px 32px;
  position: relative;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PopupTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #2c7fff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2c7fff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2c7fff;
  }
`;

const DateTimeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const ColorOption = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid ${props => props.$selected ? props.$color : 'transparent'};
  background-color: ${props => props.$color};
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #2c7fff;
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a5fd9;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const TaskPopup = ({ show, task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: TASK_STATUS.TODO,
    color: TASK_COLORS.BLUE
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        startDate: task.startDate.toISOString().split('T')[0],
        endDate: task.endDate.toISOString().split('T')[0],
        status: task.status,
        color: task.color
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        startDate: today,
        endDate: today,
        status: TASK_STATUS.TODO,
        color: TASK_COLORS.BLUE
      });
    }
  }, [task, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    const taskData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate)
    };
    
    onSave(taskData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!show) return null;

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <PopupHeader>
          <PopupTitle>{task ? '일정 수정' : '새로운 일정 추가'}</PopupTitle>
          <CloseButton onClick={onClose}>􀆄</CloseButton>
        </PopupHeader>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>제목</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="일정 제목을 입력하세요"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>내용</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="일정 설명을 입력하세요"
            />
          </FormGroup>
          
          <DateTimeRow>
            <FormGroup>
              <Label>시작</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>종료</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
              />
            </FormGroup>
          </DateTimeRow>
          
          <FormGroup>
            <Label>상태</Label>
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value={TASK_STATUS.TODO}>Todo</option>
              <option value={TASK_STATUS.PROGRESS}>Progress</option>
              <option value={TASK_STATUS.DONE}>Done</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>색상</Label>
            <ColorPicker>
              {Object.values(TASK_COLORS).map(color => (
                <ColorOption
                  key={color}
                  type="button"
                  $color={color}
                  $selected={formData.color === color}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </ColorPicker>
          </FormGroup>
          
          <SubmitButton type="submit">
            {task ? '수정' : '추가'}
          </SubmitButton>
        </form>
      </PopupContainer>
    </PopupOverlay>
  );
};

export default TaskPopup;
