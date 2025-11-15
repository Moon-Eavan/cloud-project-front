import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'todo' | 'inProgress' | 'done';
  parentTaskId?: string;
}

interface GanttChartProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

interface ProjectView {
  id: string;
  expanded: boolean;
}

export default function GanttChart({ tasks, setTasks }: GanttChartProps) {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isSubTaskDialogOpen, setIsSubTaskDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectViews, setProjectViews] = useState<ProjectView[]>([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [newSubTask, setNewSubTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  // Parent tasks (tasks without parentTaskId)
  const parentTasks = tasks.filter(task => !task.parentTaskId);

  // Get subtasks for a parent task
  const getSubtasks = (parentId: string) => {
    return tasks.filter(task => task.parentTaskId === parentId);
  };

  // Check if a project is expanded
  const isExpanded = (projectId: string) => {
    const view = projectViews.find(v => v.id === projectId);
    return view ? view.expanded : true;
  };

  const toggleProject = (projectId: string) => {
    setProjectViews(prev => {
      const existing = prev.find(v => v.id === projectId);
      if (existing) {
        return prev.map(v => v.id === projectId ? { ...v, expanded: !v.expanded } : v);
      } else {
        return [...prev, { id: projectId, expanded: false }];
      }
    });
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        
        // Parent task가 완료/취소되면 모든 subtask도 완료/취소
        if (!task.parentTaskId) {
          const subtasks = getSubtasks(taskId);
          const updatedSubtasks = subtasks.map(st => ({ ...st, status: newStatus }));
          const otherTasks = tasks.filter(t => t.id !== taskId && !subtasks.some(st => st.id === t.id));
          setTasks([...otherTasks, { ...task, status: newStatus }, ...updatedSubtasks]);
          return { ...task, status: newStatus };
        }
        
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const handleAddProject = () => {
    if (newProject.title.trim() && newProject.startDate && newProject.endDate) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newProject.title,
        description: newProject.description,
        startDate: new Date(newProject.startDate),
        endDate: new Date(newProject.endDate),
        status: 'todo',
      };
      
      setTasks([...tasks, newTask]);
      setNewProject({ title: '', description: '', startDate: '', endDate: '' });
      setIsProjectDialogOpen(false);
    }
  };

  const handleAddSubTask = () => {
    if (
      selectedProjectId &&
      newSubTask.title.trim() &&
      newSubTask.startDate &&
      newSubTask.endDate
    ) {
      const newTask: Task = {
        id: `${selectedProjectId}-${Date.now()}`,
        title: newSubTask.title,
        description: newSubTask.description,
        startDate: new Date(newSubTask.startDate),
        endDate: new Date(newSubTask.endDate),
        status: 'todo',
        parentTaskId: selectedProjectId,
      };

      setTasks([...tasks, newTask]);
      setNewSubTask({ title: '', description: '', startDate: '', endDate: '' });
      setIsSubTaskDialogOpen(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    // Parent task를 삭제하면 모든 subtask도 삭제
    const subtasks = getSubtasks(taskId);
    const subtaskIds = subtasks.map(st => st.id);
    setTasks(tasks.filter(t => t.id !== taskId && !subtaskIds.includes(t.id)));
  };

  const handleDeleteSubTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getBarPosition = (startDate: Date, endDate: Date) => {
    const chartStart = new Date(2025, 10, 1);
    const chartEnd = new Date(2025, 11, 31);
    const totalDays = Math.ceil((chartEnd.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24));
    const startOffset = Math.max(
      0,
      Math.ceil((startDate.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              작업 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 작업 추가</DialogTitle>
              <DialogDescription>새로운 작업을 추가합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="project-name">프로젝트 이름</Label>
                <Input
                  id="project-name"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="프로젝트 이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="project-description">설명</Label>
                <Input
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="프로젝트 설명을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="project-start">시작일</Label>
                <Input
                  id="project-start"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="project-end">종료일</Label>
                <Input
                  id="project-end"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddProject} className="w-full">
                추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isSubTaskDialogOpen} onOpenChange={setIsSubTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>서브태스크 추가</DialogTitle>
            <DialogDescription>
              {selectedProjectId && (
                <>
                  <span className="text-gray-600">상위 프로젝트: </span>
                  <span className="text-gray-900">{tasks.find(p => p.id === selectedProjectId)?.title}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="subtask-name">태스크 이름</Label>
              <Input
                id="subtask-name"
                value={newSubTask.title}
                onChange={(e) => setNewSubTask({ ...newSubTask, title: e.target.value })}
                placeholder="태스크 이름을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="subtask-description">설명</Label>
              <Input
                id="subtask-description"
                value={newSubTask.description}
                onChange={(e) => setNewSubTask({ ...newSubTask, description: e.target.value })}
                placeholder="태스크 설명을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="subtask-start">시작일</Label>
              <Input
                id="subtask-start"
                type="date"
                value={newSubTask.startDate}
                onChange={(e) => setNewSubTask({ ...newSubTask, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subtask-end">종료일</Label>
              <Input
                id="subtask-end"
                type="date"
                value={newSubTask.endDate}
                onChange={(e) => setNewSubTask({ ...newSubTask, endDate: e.target.value })}
              />
            </div>
            <Button onClick={handleAddSubTask} className="w-full">
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-6 overflow-x-auto bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex mb-4">
            <div className="w-64 pr-4"></div>
            <div className="flex-1 flex justify-between text-sm text-gray-700 border-b border-gray-200 pb-3">
              <span>11월 1일</span>
              <span>11월 15일</span>
              <span>12월 1일</span>
              <span>12월 15일</span>
              <span>12월 31일</span>
            </div>
          </div>

          {/* Projects */}
          {parentTasks.map((project) => {
            const subtasks = getSubtasks(project.id);
            const expanded = isExpanded(project.id);
            
            return (
              <div key={project.id} className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-64 pr-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-gray-100 rounded-lg"
                      onClick={() => toggleProject(project.id)}
                    >
                      {expanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                    </Button>
                    <span className={`truncate text-gray-900 flex-1 ${project.status === 'done' ? 'line-through opacity-60' : ''}`}>{project.title}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleTaskComplete(project.id)}>
                          {project.status === 'done' ? 'Done 취소' : 'Done으로 변경'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(project.id)}
                          className="text-red-600"
                        >
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-1 relative h-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-xl"></div>
                    <div
                      className={`absolute h-full rounded-xl shadow-md ${project.status === 'done' ? 'opacity-50' : ''}`}
                      style={{
                        ...getBarPosition(project.startDate, project.endDate),
                        backgroundColor: '#C7E9E4',
                        boxShadow: '0 4px 6px -1px rgba(199, 233, 228, 0.3)'
                      }}
                    ></div>
                  </div>
                </div>

                {expanded && (
                  <div className="ml-8">
                    {subtasks.map((subTask) => (
                      <div key={subTask.id} className="flex items-center mb-2">
                        <div className="w-56 pr-4 flex items-center gap-2">
                          <span className={`text-sm text-gray-700 truncate flex-1 ${subTask.status === 'done' ? 'line-through opacity-60' : ''}`}>{subTask.title}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreVertical className="w-3 h-3 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleTaskComplete(subTask.id)}>
                                {subTask.status === 'done' ? 'Done 취소' : 'Done으로 변경'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteSubTask(subTask.id)}
                                className="text-red-600"
                              >
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex-1 relative h-5">
                          <div className="absolute inset-0 bg-gray-50 rounded-lg"></div>
                          <div
                            className={`absolute h-full rounded-lg shadow-md ${subTask.status === 'done' ? 'opacity-50' : ''}`}
                            style={{
                              ...getBarPosition(subTask.startDate, subTask.endDate),
                              backgroundColor: '#B4CEE1',
                              boxShadow: '0 4px 6px -1px rgba(180, 206, 225, 0.3)'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center mb-2">
                      <div className="w-56 pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setIsSubTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          서브태스크 추가
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}