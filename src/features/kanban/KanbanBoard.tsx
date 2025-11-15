import { useState } from 'react';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

import { useTaskContext } from '../../store/TaskContext';
import { KANBAN_COLUMNS } from '../../lib/constants';
import { TaskStatus } from '../../types';
import { getTodayDate } from '../../lib/utils';

export default function KanbanBoard() {
  const { getKanbanTasks, createTask, updateTaskStatus, deleteTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  const kanbanTasks = getKanbanTasks();

  // spec.md 규칙: 칸반보드에서는 parent task만 생성 가능
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    await createTask({
      title: newTask.title,
      description: newTask.description || undefined,
      startDate: new Date(newTask.startDate),
      endDate: new Date(newTask.endDate),
      parentTaskId: null, // 항상 parent task로 생성
    });

    toast.success('작업이 추가되었습니다.');
    setNewTask({ title: '', description: '', startDate: getTodayDate(), endDate: getTodayDate() });
    setIsDialogOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    toast.success('작업이 삭제되었습니다.');
  };

  // spec.md 규칙: status가 done이 되면 Gantt에서도 취소선 표시
  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus);
    if (newStatus === 'done') {
      toast.success('작업이 완료되었습니다.');
    }
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
              <DialogDescription>새로운 작업을 추가합니다. (Parent Task로 생성됩니다)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="작업 설명을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="startDate">시작 날짜</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTask.startDate}
                  onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">종료 날짜</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTask.endDate}
                  onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddTask} className="w-full bg-blue-500 hover:bg-blue-600">
                추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map(column => (
          <div key={column.id}>
            <Card
              className={`border-t-4 ${column.color} bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span>{column.title}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {kanbanTasks.filter(task => task.status === column.id).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kanbanTasks
                    .filter(task => task.status === column.id)
                    .map(task => (
                      <Card key={task.id} className="shadow-md hover:shadow-xl transition-all bg-white border-gray-200 rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4
                                className={`mb-1 text-gray-900 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                              >
                                {task.title}
                              </h4>
                              <p
                                className={`text-sm text-gray-600 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                              >
                                {task.description}
                              </p>
                              {task.parentTaskId && (
                                <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Subtask
                                </span>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-lg">
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {KANBAN_COLUMNS.filter(col => col.id !== task.status).map(col => (
                                  <DropdownMenuItem key={col.id} onClick={() => handleMoveTask(task.id, col.id)}>
                                    {col.title}로 이동
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
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
