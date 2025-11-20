import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  const renderDays = () => {
    const days = [];
    // Calculate if we need 6 weeks or 5 weeks
    const totalCells = (firstDayOfMonth + daysInMonth > 35) ? 42 : 35;
    
    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const isTodayCell = isCurrentMonth && isToday(dayNumber);
      
      days.push(
        <div
          key={i}
          className="aspect-square flex items-center justify-center"
        >
          {isCurrentMonth && (
            <div
              className={`w-full h-full flex items-center justify-center text-xs rounded-md transition-colors ${
                isTodayCell
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {dayNumber}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousMonth}
          className="h-6 w-6 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
        <span className="text-xs text-gray-900">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-6 w-6 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-[10px] py-1 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}