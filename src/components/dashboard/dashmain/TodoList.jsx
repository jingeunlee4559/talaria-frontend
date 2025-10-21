import { CheckCircleIcon, EditIcon, MoreVerticalIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const TodoList = ({ className }) => {
    const [tasks, setTasks] = useState([
        { id: 1, text: '3분기 마케팅 제안서 번역 검토', completed: false },
        { id: 2, text: 'APAC 팀과 후속 회의 일정 조율', completed: false },
        { id: 3, text: 'Project Helios 계약서 최종본 업로드', completed: true },
        { id: 4, text: '주간 보고서 작성', completed: false },
        { id: 5, text: '경쟁사 분석 자료 수집', completed: false },
        { id: 6, text: '다음 분기 예산안 초안 작성', completed: false },
        { id: 7, text: '신규 입사자 온보딩 자료 확인', completed: false },
        { id: 8, text: '디자인 팀 시안 검토', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');
    const [openMenu, setOpenMenu] = useState(null);
    const menuRef = useRef(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingText, setEditingText] = useState('');

    const toggleTask = (id) => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTask.trim() !== '') {
            setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
        setOpenMenu(null);
    };

    const handleEditClick = (task) => {
        setEditingTask(task.id);
        setEditingText(task.text);
        setOpenMenu(null);
    };

    const handleSaveEdit = (e, id) => {
        e.preventDefault();
        setTasks(tasks.map((task) => (task.id === id ? { ...task, text: editingText } : task)));
        setEditingTask(null);
        setEditingText('');
    };

    // ⭐️ 수정된 부분: 외부 클릭 감지 로직 수정
    useEffect(() => {
        const handleClickOutside = (event) => {
            // menuRef.current가 존재하고, 클릭한 영역이 메뉴(menuRef.current)에 포함되지 않을 때만 메뉴를 닫습니다.
            // 기존 로직은 메뉴 내부를 클릭해도 닫히는 오류가 있었습니다.
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        };

        // 메뉴가 열려 있을 때만 mousedown 이벤트 리스너를 추가합니다.
        if (openMenu !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // 컴포넌트가 언마운트되거나 openMenu가 변경되기 전에 이벤트 리스너를 정리합니다.
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenu]);

    return (
        <div className={`bg-white/60 backdrop-blur-sm p-5 rounded-xl shadow-sm flex flex-col ${className}`}>
            <h3 className="font-bold text-slate-800 text-lg">오늘의 할 일</h3>
            <div className="space-y-1 mt-4 overflow-y-auto pr-2 custom-scrollbar max-h-72">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 group p-2 rounded-md hover:bg-slate-200/50 transition-colors">
                        {editingTask === task.id ? (
                            <form onSubmit={(e) => handleSaveEdit(e, task.id)} className="flex-1 flex space-x-2">
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="w-full bg-slate-100 px-2 py-1 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    autoFocus
                                    onBlur={(e) => handleSaveEdit(e, task.id)}
                                />
                                <button
                                    type="submit"
                                    // ⭐️ 수정된 부분: onMouseDown 이벤트 추가하여 onBlur와의 충돌 방지
                                    // 이 버튼을 클릭했을 때 input의 onBlur가 먼저 실행되는 것을 막아줍니다.
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="bg-indigo-500 text-white px-2 py-1 rounded-md text-sm"
                                >
                                    저장
                                </button>
                            </form>
                        ) : (
                            <>
                                <div onClick={() => toggleTask(task.id)} className="flex items-center space-x-3 cursor-pointer flex-1">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                            task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'
                                        }`}
                                    >
                                        {task.completed && <CheckCircleIcon className="w-3 h-3 text-white" strokeWidth="3" />}
                                    </div>
                                    <span className={`flex-1 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                                </div>
                                <div className="relative" data-menu-id={task.id}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenu(openMenu === task.id ? null : task.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600"
                                    >
                                        <MoreVerticalIcon className="w-5 h-5" />
                                    </button>
                                    {openMenu === task.id && (
                                        <div ref={menuRef} className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg z-10">
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleEditClick(task);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                                <span>수정</span>
                                            </a>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDeleteTask(task.id);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span>삭제</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddTask} className="mt-auto pt-4 flex space-x-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="새 할 일 추가..."
                    className="w-full bg-slate-100/70 px-3 py-2 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button type="submit" className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 shrink-0">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};
export default TodoList;
