import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText, Check, Download, UploadCloud, Search, Info, Trash2 } from 'lucide-react';

// --- 서브 컴포넌트들 (디자인 개선) ---

// 1. 탭 버튼 컴포넌트
const TabButton = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className="relative px-1 pb-3 font-semibold transition text-base focus:outline-none">
        <span className={isActive ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}>{children}</span>
        {isActive && (
            <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" layoutId="active-tab-underline" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
        )}
    </button>
);

// 2. 문서 아이템 컴포넌트
const DocumentItem = ({ doc, isSelected, onSelect }) => (
    <motion.li
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
        layout
    >
        <div
            onClick={onSelect}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                isSelected ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-white border-transparent hover:border-zinc-300'
            }`}
        >
            <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300 group-hover:border-zinc-400'
                }`}
            >
                {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-zinc-800 truncate">{doc.name}</p>
                <p className="text-sm text-zinc-500">{doc.date}</p>
            </div>
            <FileText className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        </div>
    </motion.li>
);

// 3. 비어있을 때 표시할 컴포넌트
const EmptyState = ({ mode, isSearching }) => {
    const messages = {
        myDocs: {
            icon: <FileText size={48} className="text-zinc-300" />,
            title: isSearching ? '검색 결과가 없습니다' : '문서가 없습니다',
            description: isSearching ? '다른 키워드로 검색해보세요.' : '새로운 문서를 추가하여 회의를 준비하세요.',
        },
        roomDocs: {
            icon: <Info size={48} className="text-zinc-300" />,
            title: isSearching ? '검색 결과가 없습니다' : '공유된 문서가 없습니다',
            description: isSearching ? '다른 키워드로 검색해보세요.' : '아직 회의에 공유된 문서가 없습니다.',
        },
    };
    const { icon, title, description } = messages[mode];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center text-center h-full text-zinc-500 p-8"
        >
            <div className="p-4 bg-slate-200 rounded-full">{icon}</div>
            <h3 className="mt-6 text-lg font-semibold text-zinc-700">{title}</h3>
            <p className="mt-2 text-sm">{description}</p>
        </motion.div>
    );
};

// --- 메인 모달 컴포넌트 (디자인 개선) ---

const DocumentListModal = ({ isOpen, onClose, myDocuments = [], roomDocuments = [], onAddToMeeting, onDownloadSelected, initialMode = 'myDocs' }) => {
    const [mode, setMode] = useState(initialMode);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const documents = useMemo(() => (mode === 'myDocs' ? myDocuments : roomDocuments), [mode, myDocuments, roomDocuments]);

    const filteredDocuments = useMemo(() => documents.filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase())), [documents, searchTerm]);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setSelectedIds(new Set());
            setSearchTerm('');
        }
    }, [isOpen, initialMode]);

    const handleSelect = (id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const handleConfirm = () => {
        const selectedArray = Array.from(selectedIds);
        if (mode === 'myDocs') {
            onAddToMeeting?.(selectedArray);
        } else {
            const selectedObjects = roomDocuments.filter((doc) => selectedArray.includes(doc.id));
            onDownloadSelected?.(selectedObjects);
        }
        onClose();
    };

    const MODES_CONFIG = {
        myDocs: { title: '내 문서 추가', icon: <UploadCloud size={20} />, actionText: '회의에 추가' },
        roomDocs: { title: '회의 문서 다운로드', icon: <Download size={20} />, actionText: '다운로드' },
    };
    const { title, icon, actionText } = MODES_CONFIG[mode];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-100 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ height: '90vh', maxHeight: '720px' }}
                    >
                        {/* 헤더 */}
                        <header className="p-6 pb-0 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-zinc-800">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mt-6 flex gap-6 border-b border-zinc-200">
                                <TabButton isActive={mode === 'myDocs'} onClick={() => setMode('myDocs')}>
                                    내 문서
                                </TabButton>
                                <TabButton isActive={mode === 'roomDocs'} onClick={() => setMode('roomDocs')}>
                                    회의 문서
                                </TabButton>
                            </div>
                        </header>

                        {/* 본문 */}
                        <main className="p-6 flex-grow flex flex-col overflow-hidden">
                            <div className="relative mb-4 flex-shrink-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="문서 이름으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-400"
                                />
                            </div>

                            <div className="flex-grow overflow-y-auto -mr-3 pr-3 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
                                <AnimatePresence mode="wait">
                                    {filteredDocuments.length > 0 ? (
                                        <motion.ul key={mode} initial="hidden" animate="visible" exit="exit" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-3">
                                            {filteredDocuments.map((doc) => (
                                                <DocumentItem key={doc.id} doc={doc} isSelected={selectedIds.has(doc.id)} onSelect={() => handleSelect(doc.id)} />
                                            ))}
                                        </motion.ul>
                                    ) : (
                                        <EmptyState key={`empty-${mode}`} mode={mode} isSearching={searchTerm.length > 0} />
                                    )}
                                </AnimatePresence>
                            </div>
                        </main>

                        {/* 푸터 */}
                        <footer className="p-6 border-t border-zinc-200 bg-white/60 backdrop-blur-lg flex-shrink-0">
                            <div className="flex justify-between items-center">
                                {selectedIds.size > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-medium text-zinc-600">
                                            <span className="font-bold text-indigo-600">{selectedIds.size}개</span> 선택됨
                                        </p>
                                        <button onClick={() => setSelectedIds(new Set())} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-600 transition-colors">
                                            <Trash2 size={14} />
                                            <span>선택 해제</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div /> // 선택된 항목 없을 때 공간 차지
                                )}
                                <motion.button
                                    onClick={handleConfirm}
                                    disabled={selectedIds.size === 0}
                                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 disabled:bg-zinc-300 disabled:shadow-none disabled:cursor-not-allowed"
                                    whileHover={{ scale: selectedIds.size > 0 ? 1.05 : 1, y: selectedIds.size > 0 ? -2 : 0, transition: { type: 'spring', stiffness: 300 } }}
                                    whileTap={{ scale: selectedIds.size > 0 ? 0.98 : 1, transition: { type: 'spring', stiffness: 400 } }}
                                >
                                    {icon}
                                    <span>{actionText}</span>
                                </motion.button>
                            </div>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DocumentListModal;
