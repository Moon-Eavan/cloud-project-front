import { useState } from 'react';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'todo' | 'progress' | 'done';
  parentTaskId?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function KanbanBoard({ tasks, setTasks }: KanbanBoardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    status: 'todo' as const,
    startDate: '',
    endDate: ''
  });

  // 칸반보드에는 subtask가 없는 parent task와 subtask만 표시
  const kanbanTasks = tasks.filter(task => {
    // subtask인 경우 표시
    if (task.parentTaskId) return true;
    
    // parent task인 경우 subtask가 없는 경우만 표시
    const hasSubtasks = tasks.some(t => t.parentTaskId === task.id);
    return !hasSubtasks;
  });

  const columns = [
    { id: 'todo' as const, title: 'To Do', color: 'border-t-gray-400' },
    { id: 'progress' as const, title: 'In Progress', color: 'border-t-blue-500' },
    { id: 'done' as const, title: 'Done', color: 'border-t-green-500' },
  ];

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: newTask.title,
          description: newTask.description,
          startDate: new Date(newTask.startDate),
          endDate: new Date(newTask.endDate),
          status: newTask.status,
        },
      ]);
      setNewTask({ title: '', description: '', status: 'todo', startDate: '', endDate: '' });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleMoveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              새 작업 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 작업 추가</DialogTitle>
              <DialogDescription>새로운 작업을 추가합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="작업 설명을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="status">상태</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <Label htmlFor="startDate">시작 날짜</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">종료 날짜</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTask.endDate}
                  onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddTask} className="w-full">
                추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id}>
            <Card className={`border-t-4 ${column.color} bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span>{column.title}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {kanbanTasks.filter((task) => task.status === column.id).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kanbanTasks
                    .filter((task) => task.status === column.id)
                    .map((task) => (
                      <Card key={task.id} className="shadow-md hover:shadow-xl transition-all bg-white border-gray-200 rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`mb-1 text-gray-900 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</h4>
                              <p className={`text-sm text-gray-600 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>{task.description}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-lg">
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {columns
                                  .filter((col) => col.id !== task.status)
                                  .map((col) => (
                                    <DropdownMenuItem
                                      key={col.id}
                                      onClick={() => handleMoveTask(task.id, col.id)}
                                    >
                                      {col.title}로 이동
                                    </DropdownMenuItem>
                                  ))}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}