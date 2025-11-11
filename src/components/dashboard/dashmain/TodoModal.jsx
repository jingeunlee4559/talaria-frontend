import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import api from '../../../axios';

const TodoModal = ({ isOpen, onClose, onSave, task, taskColorStyles, colorKeys, userId }) => {
    const [text, setText] = useState('');
    const [time, setTime] = useState('');
    const [color, setColor] = useState('default');
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);

    // ✅ API: 단건 조회 (필요한 경우)
    const fetchTodoById = async (taskId) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/users/${userId}/todos/${taskId}`);
            const todoData = response.data;
            setText(todoData.text);
            setTime(todoData.time || '');
            setColor(todoData.color);
        } catch (err) {
            console.error('Error fetching todo:', err);
            alert('할 일 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (task) {
            // task 객체가 완전한 경우 직접 사용
            if (task.text) {
                setText(task.text);
                setTime(task.time || '');
                setColor(task.color);
            }
            // task.id만 있는 경우 API로 조회 (선택적 기능)
            else if (task.id && userId) {
                fetchTodoById(task.id);
            }
        } else {
            setText('');
            setTime('');
            setColor('default');
        }
    }, [task, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSave({ ...task, text, time, color });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm m-4 animate-scale-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{task ? '할 일 수정' : '새 할 일 추가'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">할 일</label>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="mt-1 w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                    placeholder="예: 프로젝트 기획안 작성"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">시간 (선택)</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="mt-1 w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">색상</label>
                                <div className="grid grid-cols-8 gap-2 mt-2">
                                    {colorKeys.map((colorKey) => {
                                        const style = taskColorStyles[colorKey];
                                        return (
                                            <button
                                                key={colorKey}
                                                type="button"
                                                onClick={() => setColor(colorKey)}
                                                className={`w-7 h-7 rounded-full border-2 ${style.dot} ${style.dotCompleted.replace('bg-', 'hover:bg-')} transition-all transform hover:scale-110 ${
                                                    color === colorKey ? 'ring-2 ring-indigo-500 ring-offset-2' : 'ring-0'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold bg-transparent text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                저장
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TodoModal;
