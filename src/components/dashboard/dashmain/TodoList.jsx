import { Check, Edit, MoreVertical, Plus, Trash } from 'lucide-react';
import { React, useContext, useEffect, useRef, useState } from 'react';
import axios from '../../../axios';
import Swal from 'sweetalert2';
import TodoModal from './TodoModal';
import { UserContext } from '../../../contexts/UserContext';

// 스타일 상수
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

// 📌 컬러 코드를 컬러명으로 매핑
const getColorNameFromCode = (colorCode) => {
    const colorMap = {
        '#FF6B6B': 'pink',
        '#FFD93D': 'yellow',
        '#6BCF7F': 'green',
        '#4D96FF': 'blue',
        '#00D9FF': 'cyan',
        '#A78BFA': 'violet',
        '#FF9B50': 'orange',
    };
    return colorMap[colorCode] || 'default';
};

// 📌 컬러명을 컬러 코드로 매핑
const getColorCodeFromName = (colorName) => {
    const colorMap = {
        pink: '#FF6B6B',
        yellow: '#FFD93D',
        green: '#6BCF7F',
        blue: '#4D96FF',
        cyan: '#00D9FF',
        violet: '#A78BFA',
        orange: '#FF9B50',
        default: '#6366F1',
    };
    return colorMap[colorName] || '#6366F1';
};

const mapBackendToFrontend = (backendTask) => ({
    id: backendTask.id || backendTask.task_id, // ✅ fallback 처리
    text: backendTask.title,
    completed: backendTask.status === 'completed',
    color: getColorNameFromCode(backendTask.color_code),
    time: backendTask.due_time?.substring(0, 5) || '',
    description: backendTask.description || '',
    dueDate: backendTask.due_date || null,
    displayOrder: backendTask.display_order || 0,
    meetingId: backendTask.meeting_id || null,
});

// 📌 프론트엔드 → 백엔드 POST/PUT (camelCase, dueDate 필수)
const mapFrontendToBackend = (frontendTask, userId) => {
    // dueDate가 없으면 오늘 날짜 사용
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

    const payload = {
        userId: userId,
        title: frontendTask.text || '새로운 할 일',
        description: frontendTask.description || '',
        dueDate: frontendTask.dueDate || today, // 필수 필드
        colorCode: getColorCodeFromName(frontendTask.color || 'default'),
        displayOrder: frontendTask.displayOrder || 0,
    };

    // dueTime과 meetingId는 값이 있을 때만 포함
    if (frontendTask.time) {
        payload.dueTime = `${frontendTask.time}:00`;
    }
    if (frontendTask.meetingId) {
        payload.meetingId = frontendTask.meetingId;
    }

    return payload;
};

const TodoList = ({ className }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [openMenu, setOpenMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState('bottom');
    const menuRef = useRef(null);
    const listRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const { user, loading: userLoading } = useContext(UserContext);
    const userId = user?.userId;

    // ✅ API: Todo 목록 조회
    const fetchTodos = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/users/${userId}/todos`);
            const backendTodos = response.data.items || [];

            console.log('📥 Backend Response:', backendTodos);

            const frontendTodos = backendTodos.map(mapBackendToFrontend);

            console.log('✅ Mapped Frontend Todos:', frontendTodos);

            setTasks(frontendTodos);
        } catch (err) {
            setError('할 일 목록을 불러오는데 실패했습니다.');
            console.error('❌ Error fetching todos:', err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ API: Todo 생성
    const createTodo = async (todoData) => {
        try {
            const backendData = mapFrontendToBackend(todoData, userId);
            console.log('📤 Creating todo with data:', JSON.stringify(backendData, null, 2));

            const response = await axios.post(`/api/users/${userId}/todos`, backendData);

            console.log('✅ Create response:', response.data);

            return mapBackendToFrontend(response.data);
        } catch (err) {
            console.error('❌ Error creating todo:', err);
            console.error('📤 Request data was:', JSON.stringify(mapFrontendToBackend(todoData, userId), null, 2));
            if (err.response) {
                console.error('📥 Response status:', err.response.status);
                console.error('📥 Response data:', err.response.data);
                if (err.response.data.errors) {
                    console.error('📋 Validation errors:');
                    err.response.data.errors.forEach((error, index) => {
                        console.error(`  ${index + 1}.`, error);
                    });
                }
            }
            throw err;
        }
    };

    // ✅ API: Todo 수정
    const updateTodo = async (taskId, todoData) => {
        try {
            const backendData = mapFrontendToBackend(todoData, userId);
            console.log('📤 Updating todo with data:', backendData);

            // 📌 변경점: PATCH 요청이 성공했는지 확인만 하고, 응답 데이터는 사용하지 않습니다.
            await axios.patch(`/api/users/${userId}/todos/${taskId}`, backendData); // PUT 또는 PATCH (서버 API에 맞게)

            console.log('✅ Todo updated successfully:', taskId);
            // 📌 변경점: 아무것도 반환하지 않습니다.
        } catch (err) {
            console.error('❌ Error updating todo:', err);
            throw err;
        }
    };

    const toggleTodoComplete = async (taskId, currentTask) => {
        try {
            const newStatus = currentTask.completed ? 'pending' : 'completed';
            const response = await axios.patch(`/api/users/${userId}/todos/${taskId}/status`, { status: newStatus }, { headers: { 'Content-Type': 'application/json' } });

            console.log('✅ Toggle response (PATCH):', response.data);
            // 📌 변경점: 서버 응답을 그대로 반환하거나, 성공 여부만 반환합니다.
            // 여기서는 별도의 반환 값이 필요 없습니다.
            return;
        } catch (err) {
            console.error('❌ Error toggling todo:', err);
            throw err; // 에러를 상위로 던져서 catch 블록에서 처리하게 합니다.
        }
    };
    // ✅ API: Todo 삭제
    const deleteTodo = async (taskId) => {
        try {
            await axios.delete(`/api/users/${userId}/todos/${taskId}`);
            console.log('✅ Todo deleted:', taskId);
        } catch (err) {
            console.error('❌ Error deleting todo:', err);
            throw err;
        }
    };

    // 컴포넌트 마운트 시 Todo 목록 불러오기
    useEffect(() => {
        // 5. 로그인된 사용자(userId)가 있을 때만 fetchTodos 호출
        if (userId) {
            fetchTodos();
        } else {
            // 사용자가 없으면(로그아웃 상태) 할 일 목록을 비워줌
            setTasks([]);
        }
    }, [userId]);

    const handleOpenAddModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    // Todo 저장 (생성 또는 수정)
    const handleSaveTask = async (taskData) => {
        try {
            if (taskData.id) {
                // 수정
                await updateTodo(taskData.id, taskData); // 1. API 호출을 기다립니다.

                // 2. 💡 API 호출이 성공하면, 서버 응답 대신 이미 가지고 있는 최신 데이터(taskData)로 상태를 업데이트합니다.
                setTasks(tasks.map((task) => (task.id === taskData.id ? taskData : task)));

                // 성공 메시지
                Swal.fire({
                    icon: 'success',
                    title: '수정 완료!',
                    text: '할 일이 성공적으로 수정되었습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                // 생성 로직은 기존과 동일
                const newTask = await createTodo(taskData);
                setTasks([newTask, ...tasks]);

                // 성공 메시지
                Swal.fire({
                    icon: 'success',
                    title: '추가 완료!',
                    text: '새로운 할 일이 추가되었습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || '할 일 저장에 실패했습니다.';

            Swal.fire({
                icon: 'error',
                title: '오류 발생',
                text: errorMessage,
                confirmButtonText: '확인',
                confirmButtonColor: '#6366F1',
            });
        }
    };

    // Todo 완료 상태 토글
    const toggleTask = async (id) => {
        const currentTask = tasks.find((task) => task.id === id);
        if (!currentTask) return;

        // 1. 낙관적 업데이트: UI를 먼저 변경
        setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));

        try {
            // 2. API 호출
            await toggleTodoComplete(id, currentTask);
            // 📌 변경점: 성공 시 별도의 state 업데이트를 하지 않습니다. (이미 낙관적 업데이트 됨)
        } catch (err) {
            // 3. 실패 시 롤백: UI를 원래 상태로 되돌림
            setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));

            Swal.fire({
                icon: 'error',
                title: '상태 변경 실패',
                text: '상태 변경에 실패했습니다. 다시 시도해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#6366F1',
            });
        }
    };

    // Todo 삭제
    const handleDeleteTask = async (id) => {
        const result = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: '삭제된 할 일은 복구할 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
        });

        if (!result.isConfirmed) return;

        try {
            await deleteTodo(id);
            setTasks(tasks.filter((task) => task.id !== id));
            setOpenMenu(null);

            // 삭제 성공 메시지
            Swal.fire({
                icon: 'success',
                title: '삭제 완료!',
                text: '할 일이 삭제되었습니다.',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '할 일 삭제에 실패했습니다. 다시 시도해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#6366F1',
            });
        }
    };

    // 🔧 개선된 메뉴 위치 계산 - 뷰포트 기준으로 변경
    const handleMenuToggle = (taskId, event) => {
        event.stopPropagation();

        if (openMenu === taskId) {
            setOpenMenu(null);
            return;
        }

        const button = event.currentTarget;
        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const menuHeight = 100; // 메뉴 높이 (여유있게 설정)
        const spaceBelow = viewportHeight - buttonRect.bottom; // 뷰포트 기준 아래 공간
        const spaceAbove = buttonRect.top; // 뷰포트 기준 위 공간

        // 아래 공간이 충분하지 않고, 위 공간이 더 크면 위로 표시
        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            setMenuPosition('top');
        } else {
            setMenuPosition('bottom');
        }

        setOpenMenu(taskId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        };
        if (openMenu !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenu]);

    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (userLoading) {
        return (
            <div className={`bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-lg flex justify-center items-center ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className={`bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center text-gray-500 ${className}`}>
                <p>오늘의 할 일을 보려면 로그인이 필요합니다.</p>
            </div>
        );
    }

    return (
        <>
            <TodoModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveTask} task={editingTask} taskColorStyles={taskColorStyles} colorKeys={colorKeys} userId={userId} />
            <div className={`bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-lg font-sans w-full flex flex-col ${className}`}>
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-1">
                    <h2 className="font-bold text-xl text-gray-800">오늘의 할 일</h2>
                    <span className="text-sm font-semibold text-gray-500">
                        {completedTasks}/{totalTasks}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>

                {/* 로딩 상태 */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                )}

                {/* 에러 상태 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button onClick={fetchTodos} className="text-red-600 underline text-sm mt-2">
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 할 일 목록 */}
                {!loading && !error && (
                    <div ref={listRef} className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[280px]">
                        {tasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>할 일이 없습니다.</p>
                                <p className="text-sm mt-1">새로운 할 일을 추가해보세요!</p>
                            </div>
                        ) : (
                            tasks.map((task) => {
                                const colors = taskColorStyles[task.color] || taskColorStyles.default;

                                return (
                                    <div key={task.id} className={`transition-all duration-300 group ${task.completed ? 'opacity-60' : ''}`}>
                                        <div className={`flex items-start p-3 rounded-lg ${task.completed ? '' : colors.bg + ' ' + colors.border}`}>
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 transition-colors ${
                                                    task.completed ? colors.dotCompleted : `${colors.dot} bg-white`
                                                }`}
                                            >
                                                {task.completed && <Check className="w-3 h-3 text-white" strokeWidth="3" />}
                                            </button>
                                            <div className="flex-grow cursor-pointer pt-0.5" onClick={() => toggleTask(task.id)}>
                                                <p className={`font-medium leading-tight ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.text}</p>
                                                {task.time && <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400 line-through' : 'text-indigo-600 font-semibold'}`}>{task.time}</p>}
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => handleMenuToggle(task.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-opacity"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                {openMenu === task.id && (
                                                    <div
                                                        ref={menuRef}
                                                        className={`absolute right-0 w-32 bg-white rounded-lg shadow-xl z-50 py-1 border border-gray-200 ${
                                                            menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                                                        }`}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleOpenEditModal(task);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors rounded-t-lg"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            <span>수정</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleDeleteTask(task.id);
                                                            }}
                                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors rounded-b-lg"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                            <span>삭제</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

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
