import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, MoreVertical, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tasksApi } from '@/api/tasksApi';
import { toast } from 'sonner';
import type { Task } from '@/types';

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

  // 기본값: 시작일 = 오늘, 종료일 = 내일
  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0]
    };
  };

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    ...getDefaultDates()
  });
  const [newSubTask, setNewSubTask] = useState({
    title: '',
    description: '',
    ...getDefaultDates()
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 날짜 범위 설정: 오늘부터 -60일 ~ +120일
  const today = new Date();
  const chartStart = new Date(today);
  chartStart.setDate(chartStart.getDate() - 60);
  chartStart.setHours(0, 0, 0, 0);
  
  const chartEnd = new Date(today);
  chartEnd.setDate(chartEnd.getDate() + 120);
  chartEnd.setHours(23, 59, 59, 999);

  const totalDays = Math.ceil((chartEnd.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24));
  const dayWidth = 40; // 각 날짜당 픽셀 너비

  // 날짜 헤더 생성 (7일 간격)
  const generateDateHeaders = () => {
    const headers = [];
    const current = new Date(chartStart);
    
    while (current <= chartEnd) {
      headers.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    
    return headers;
  };

  const dateHeaders = generateDateHeaders();

  // 컴포넌트 마운트시 오늘 날짜 위치로 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      const daysFromStart = Math.ceil((today.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24));
      const scrollPosition = (daysFromStart - 1) * dayWidth; // 하루 전 위치
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, []);

  // 드래그 스크롤 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // 좌우 버튼 스크롤
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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

  const toggleTaskComplete = async (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const newStatus = targetTask.status === 'done' ? 'todo' : 'done';

    try {
      // Parent task인 경우 모든 subtask도 함께 완료/취소
      if (!targetTask.parentTaskId) {
        // Update parent task
        await tasksApi.updateTaskStatus(taskId, newStatus);

        // Update all subtasks
        const subtasks = getSubtasks(taskId);
        await Promise.all(
          subtasks.map(subtask => tasksApi.updateTaskStatus(subtask.id, newStatus))
        );

        setTasks(tasks.map(task => {
          // Parent task 자체 업데이트
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          // 해당 parent의 모든 subtask도 업데이트
          if (task.parentTaskId === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        }));
      } else {
        // Subtask인 경우 해당 task만 업데이트
        await tasksApi.updateTaskStatus(taskId, newStatus);
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
      toast.success(newStatus === 'done' ? '작업이 완료되었습니다.' : '작업 완료가 취소되었습니다.');
    } catch (error) {
      console.error('Failed to toggle task status:', error);
      toast.error('작업 상태 변경에 실패했습니다.');
    }
  };

  const handleAddProject = async () => {
    if (newProject.title.trim() && newProject.startDate && newProject.endDate) {
      try {
        const createdTask = await tasksApi.createTaskFromGantt({
          title: newProject.title,
          description: newProject.description,
          startDate: new Date(newProject.startDate),
          endDate: new Date(newProject.endDate),
          status: 'todo',
          parentTaskId: null,
        });

        setTasks([...tasks, createdTask]);
        setNewProject({ title: '', description: '', ...getDefaultDates() });
        setIsProjectDialogOpen(false);
        toast.success('프로젝트가 추가되었습니다.');
      } catch (error) {
        console.error('Failed to create project:', error);
        toast.error('프로젝트 추가에 실패했습니다.');
      }
    }
  };

  const handleAddSubTask = async () => {
    if (
      selectedProjectId &&
      newSubTask.title.trim() &&
      newSubTask.startDate &&
      newSubTask.endDate
    ) {
      try {
        const createdTask = await tasksApi.createSubtask(selectedProjectId, {
          title: newSubTask.title,
          description: newSubTask.description,
          startDate: new Date(newSubTask.startDate),
          endDate: new Date(newSubTask.endDate),
          status: 'todo',
        });

        setTasks([...tasks, createdTask]);
        setNewSubTask({ title: '', description: '', ...getDefaultDates() });
        setIsSubTaskDialogOpen(false);
        toast.success('서브태스크가 추가되었습니다.');
      } catch (error) {
        console.error('Failed to create subtask:', error);
        toast.error('서브태스크 추가에 실패했습니다.');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Backend will handle deleting all subtasks
      await tasksApi.deleteTask(taskId);

      // Parent task를 삭제하면 모든 subtask도 삭제
      const subtasks = getSubtasks(taskId);
      const subtaskIds = subtasks.map(st => st.id);
      setTasks(tasks.filter(t => t.id !== taskId && !subtaskIds.includes(t.id)));
      toast.success('프로젝트가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('프로젝트 삭제에 실패했습니다.');
    }
  };

  const handleDeleteSubTask = async (taskId: string) => {
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('서브태스크가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('서브태스크 삭제에 실패했습니다.');
    }
  };

  const getBarPosition = (startDate: Date, endDate: Date) => {
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
                <Label htmlFor="project-name">제목</Label>
                <Input
                  id="project-name"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="project-description">설명</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="작업 설명을 입력하세요"
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="project-start">시작 날짜</Label>
                <Input
                  id="project-start"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="project-end">종료 날짜</Label>
                <Input
                  id="project-end"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddProject} className="w-full bg-blue-500 hover:bg-blue-600">
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
              <Label htmlFor="subtask-name">제목</Label>
              <Input
                id="subtask-name"
                value={newSubTask.title}
                onChange={(e) => setNewSubTask({ ...newSubTask, title: e.target.value })}
                placeholder="작업 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="subtask-description">설명</Label>
              <Textarea
                id="subtask-description"
                value={newSubTask.description}
                onChange={(e) => setNewSubTask({ ...newSubTask, description: e.target.value })}
                placeholder="작업 설명을 입력하세요"
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="subtask-start">시작 날짜</Label>
              <Input
                id="subtask-start"
                type="date"
                value={newSubTask.startDate}
                onChange={(e) => setNewSubTask({ ...newSubTask, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subtask-end">종료 날짜</Label>
              <Input
                id="subtask-end"
                type="date"
                value={newSubTask.endDate}
                onChange={(e) => setNewSubTask({ ...newSubTask, endDate: e.target.value })}
              />
            </div>
            <Button onClick={handleAddSubTask} className="w-full bg-blue-500 hover:bg-blue-600">
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-6 bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl relative">
        <div 
          className="overflow-x-auto gantt-scrollbar cursor-grab active:cursor-grabbing" 
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div style={{ minWidth: `${totalDays * dayWidth}px` }}>
            {/* Timeline Header */}
            <div className="flex mb-4">
              <div className="w-64 pr-4 flex-shrink-0 sticky left-0 bg-white/60 backdrop-blur-sm z-10"></div>
              <div className="relative pt-2" style={{ width: `${totalDays * dayWidth}px` }}>
                <div className="flex border-b border-gray-200 pb-3">
                  {dateHeaders.map((date, index) => (
                    <div 
                      key={index} 
                      className="text-sm text-gray-700"
                      style={{ 
                        minWidth: `${7 * dayWidth}px`,
                        width: `${7 * dayWidth}px`,
                      }}
                    >
                      {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
                {/* 오늘 날짜 표시 */}
                <div 
                  className="absolute pointer-events-none"
                  style={{
                    top: '8px',
                    bottom: '0px',
                    left: `${((today.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* 상단 다이아몬드 */}
                  <div 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rotate-45 shadow-sm shadow-blue-500/50"
                  ></div>
                  {/* 세로선 */}
                  <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-blue-500 via-blue-400 to-transparent opacity-60"></div>
                </div>
              </div>
            </div>

            {/* Projects */}
            {parentTasks.map((project) => {
              const subtasks = getSubtasks(project.id);
              const expanded = isExpanded(project.id);
              
              return (
                <div key={project.id} className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-64 pr-4 flex-shrink-0 sticky left-0 bg-white/60 backdrop-blur-sm z-10 flex items-center gap-2">
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
                    <div className="relative h-6 flex-shrink-0" style={{ width: `${totalDays * dayWidth}px` }}>
                      <div className="absolute inset-0 bg-gray-100 rounded-xl"></div>
                      <div
                        className={`absolute h-full rounded-xl shadow-md ${project.status === 'done' ? 'opacity-50' : ''}`}
                        style={{
                          left: `${Math.max(0, Math.ceil((project.startDate.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24))) * dayWidth}px`,
                          width: `${Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth}px`,
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
                          <div className="w-56 pr-4 flex-shrink-0 sticky left-8 bg-white/60 backdrop-blur-sm z-10 flex items-center gap-2">
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
                          <div className="relative h-5 flex-shrink-0" style={{ width: `${totalDays * dayWidth}px` }}>
                            <div className="absolute inset-0 bg-gray-50 rounded-lg"></div>
                            <div
                              className={`absolute h-full rounded-lg shadow-md ${subTask.status === 'done' ? 'opacity-50' : ''}`}
                              style={{
                                left: `${Math.max(0, Math.ceil((subTask.startDate.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24))) * dayWidth}px`,
                                width: `${Math.ceil((subTask.endDate.getTime() - subTask.startDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth}px`,
                                backgroundColor: '#B4CEE1',
                                boxShadow: '0 4px 6px -1px rgba(180, 206, 225, 0.3)'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center mb-2">
                        <div className="w-56 pr-4 flex-shrink-0 sticky left-8 bg-white/60 backdrop-blur-sm z-10">
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
        </div>

        <style>{`
          .gantt-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .gantt-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .gantt-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .gantt-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </Card>
    </div>
  );
}