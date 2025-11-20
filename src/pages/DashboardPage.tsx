import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonthView from '@/features/calendar/components/MonthView';
import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import GanttChart from '@/features/tasks/components/GanttChart';
import type { Schedule, Task, Calendar } from '@/types';

interface DashboardPageProps {
  calendars: Calendar[];
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function DashboardPage({ calendars, schedules, setSchedules, tasks, setTasks }: DashboardPageProps) {
  return (
    <div className="p-6 md:p-8">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm p-1.5 h-14 rounded-2xl">
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-[#2c7fff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-xl px-6 tracking-[2.4px] uppercase"
          >
            Monthly
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            className="data-[state=active]:bg-[#2c7fff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-xl px-6 tracking-[2.4px] uppercase"
          >
            Todo
          </TabsTrigger>
          <TabsTrigger
            value="gantt"
            className="data-[state=active]:bg-[#2c7fff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-xl px-6 tracking-[2.4px] uppercase"
          >
            Gantt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <MonthView calendars={calendars} schedules={schedules} setSchedules={setSchedules} tasks={tasks} setTasks={setTasks} />
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
