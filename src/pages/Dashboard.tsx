import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import KanbanBoard from '../features/kanban/KanbanBoard';
import MonthCalendar from '../features/calendar/MonthCalendar';
import GanttChart from '../features/gantt/GanttChart';

export default function Dashboard() {
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
          <MonthCalendar />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="gantt">
          <GanttChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
