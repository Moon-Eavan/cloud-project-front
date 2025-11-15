import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import KanbanBoard from './KanbanBoard';
import MonthCalendar from './MonthCalendar';
import GanttChart from './GanttChart';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  completed?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'todo' | 'inProgress' | 'done';
  parentTaskId?: string;
}

interface MainDashboardProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function MainDashboard({ events, setEvents, tasks, setTasks }: MainDashboardProps) {
  return (
    <div className="p-6 md:p-8">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm p-1.5 h-14 rounded-2xl">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#2c7fff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-xl px-6 tracking-[2.4px] uppercase">Monthly</TabsTrigger>
          <TabsTrigger value="kanban" className="data-[state=active]:bg-[#2c7fff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-xl px-6 tracking-[2.4px] uppercase">Todo</TabsTrigger>
          <TabsTrigger value="gantt" className="data-[state=active]:bg-[#2c7fff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-xl px-6 tracking-[2.4px] uppercase">Gantt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <MonthCalendar events={events} setEvents={setEvents} tasks={tasks} setTasks={setTasks} />
        </TabsContent>
        
        <TabsContent value="kanban">
          <KanbanBoard tasks={tasks} setTasks={setTasks} />
        </TabsContent>
        
        <TabsContent value="gantt">
          <GanttChart tasks={tasks} setTasks={setTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}