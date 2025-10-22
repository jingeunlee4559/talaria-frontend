import { Check, Edit, MoreVertical, Plus, Trash } from 'lucide-react'; // X 아이콘은 TodoModal에서 사용하므로 여기서 제거
import {React, useEffect, useRef, useState } from 'react';
import TodoModal from './TodoModal';

// ✨ 1. 스타일 상수를 컴포넌트 밖으로 이동시킵니다.
// 이렇게 하면 렌더링될 때마다 새로 생성되지 않아 더 효율적입니다.
const taskColorStyles = {
  default: { bg: 'bg-white', border: 'border-gray-200', dot: 'border-gray-400', dotCompleted: 'bg-indigo-500 border-indigo-500' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', dot: 'border-pink-500', dotCompleted: 'bg-pink-500 border-pink-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'border-yellow-500', dotCompleted: 'bg-yellow-500 border-yellow-500' },
  green: { bg: 'bg-green-50', border: 'border-green-200', dot: 'border-green-500', dotCompleted: 'bg-green-500 border-green-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'border-blue-500', dotCompleted: 'bg-blue-500 border-blue-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', dot: 'border-cyan-500', dotCompleted: 'bg-cyan-500 border-cyan-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', dot: 'border-violet-500', dotCompleted: 'bg-violet-500 border-violet-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'border-orange-500', dotCompleted: 'bg-orange-500 border-orange-500' },
};
const colorKeys = Object.keys(taskColorStyles);

// --- ✨ 메인 TodoList 컴포넌트 ---
const TodoList = ({ className }) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: '3분기 마케팅 제안서 검토', completed: true, color: 'pink', time: '10:30' },
    { id: 2, text: 'APAC 팀과 회의 일정 조율', completed: false, color: 'yellow', time: '14:00' },
    { id: 3, text: '신규 프로젝트 디자인 시안 확인', completed: false, color: 'blue', time: '15:00' },
    { id: 4, text: '경쟁사 분석 자료 수집', completed: true, color: 'default', time: '' },
    { id: 5, text: '다음 분기 예산안 초안 작성', completed: false, color: 'green', time: '16:00' },
  ]);

  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // --- 핸들러 함수들은 변경 없습니다 ---
  const handleOpenAddModal = () => { setEditingTask(null); setIsModalOpen(true); };
  const handleOpenEditModal = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingTask(null); };
  const handleSaveTask = (taskData) => {
    if (taskData.id) { setTasks(tasks.map((task) => (task.id === taskData.id ? taskData : task))); } 
    else { 
      const newTasks = [{ ...taskData, id: Date.now(), completed: false }, ...tasks];
      setTasks(newTasks);
    }
  };
  const toggleTask = (id) => { setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))); };
  const handleDeleteTask = (id) => { setTasks(tasks.filter((task) => task.id !== id)); setOpenMenu(null); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) { setOpenMenu(null); }
    };
    if (openMenu !== null) { document.addEventListener('mousedown', handleClickOutside); }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <>
      {/* ✨ 2. TodoModal에 props로 스타일 정보를 전달합니다. */}
      <TodoModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveTask} 
        task={editingTask}
        taskColorStyles={taskColorStyles}
        colorKeys={colorKeys}
      />
      <div className={`bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-lg font-sans w-full flex flex-col ${className}`}>
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-bold text-xl text-gray-800">오늘의 할 일</h2>
          <span className="text-sm font-semibold text-gray-500">{completedTasks}/{totalTasks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
        </div>

        {/* 할 일 목록 */}
        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[280px]">
          {tasks.map((task) => {
            const colors = taskColorStyles[task.color] || taskColorStyles.default;
            return (
              <div key={task.id} className={`transition-all duration-300 group ${task.completed ? 'opacity-60' : ''}`}>
                <div className={`flex items-start p-3 rounded-lg ${task.completed ? '' : colors.bg + ' ' + colors.border}`}>
                  <button onClick={() => toggleTask(task.id)} className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 transition-colors ${task.completed ? colors.dotCompleted : `${colors.dot} bg-white`}`}>
                    {task.completed && <Check className="w-3 h-3 text-white" strokeWidth="3" />}
                  </button>
                  <div className="flex-grow cursor-pointer pt-0.5" onClick={() => toggleTask(task.id)}>
                    <p className={`font-medium leading-tight ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {task.text}
                    </p>
                    {task.time && (
                      <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400 line-through' : 'text-indigo-600 font-semibold'}`}>
                        {task.time}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === task.id ? null : task.id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded-full">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === task.id && (
                      <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl z-10 py-1 border">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenEditModal(task); setOpenMenu(null); }} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Edit className="w-4 h-4" /><span>수정</span></a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteTask(task.id); }} className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash className="w-4 h-4" /><span>삭제</span></a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* '새 할 일 추가' 버튼 */}
        <div className="mt-auto pt-3 border-t border-gray-200/80">
          <button onClick={handleOpenAddModal} className="w-full flex items-center text-left p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors group">
            <span className="w-5 h-5 flex items-center justify-center mr-3 bg-gray-200 group-hover:bg-indigo-500 rounded-full transition-colors">
              <Plus size={14} className="text-gray-600 group-hover:text-white transition-colors" />
            </span>
            <span className="font-semibold text-sm">새 할 일 추가</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default TodoList;