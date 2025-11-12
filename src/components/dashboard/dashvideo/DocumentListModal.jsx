import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText, Check, Download, UploadCloud, Search, Info, Trash2, Layers, CircleDot, Lock as LockIcon, Languages } from 'lucide-react';

const TabButton = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className="relative px-2 pb-3 font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md"
    >
        <span className={isActive ? 'text-indigo-600' : 'text-zinc-400 hover:text-indigo-500'}>{children}</span>
        {isActive && (
            <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" layoutId="active-tab-underline" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
        )}
    </button>
);

const SubTab = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-indigo-400'
        }`}
    >
        {children}
    </button>
);

const DocumentItem = ({ doc, isSelected, onSelect, onDelete }) => {
    const isTranslation = doc.__kind === 'translations' || doc.doc_type === 'TRANSLATION' || !!doc.trans_doc_id;

    return (
        <motion.li variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ type: 'spring', stiffness: 260, damping: 25 }} layout="position">
            <div
                onClick={onSelect}
                className={`flex items-center gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-300 group relative
          ${isSelected ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white border-transparent hover:border-indigo-400 hover:bg-white'}`}
            >
                <motion.div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    animate={{
                        backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                        borderColor: isSelected ? '#4f46e5' : '#d1d5db',
                    }}
                >
                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                                <Check className="w-4 h-4 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="flex-grow overflow-hidden">
                    <p className="font-bold text-zinc-800 truncate">
                        {doc.title ?? doc.name}
                        {isTranslation && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 align-middle">
                                <Languages size={12} /> {`${(doc.fromLang || doc.source_lang || '').toUpperCase()}→${(doc.toLang || doc.target_language || '').toUpperCase()}`}
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                        {(doc.lastModified ?? doc.date) || ''}
                        {doc.size ? <span>· {doc.size}</span> : null}
                    </p>
                </div>

                <FileText className="w-5 h-5 text-zinc-400 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full text-zinc-400 bg-transparent opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                        aria-label="Delete document"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </motion.li>
    );
};

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center h-full text-zinc-500 p-8"
        >
            <div className="p-5 bg-zinc-100 rounded-full">{icon}</div>
            <h3 className="mt-6 text-lg font-semibold text-zinc-700">{title}</h3>
            <p className="mt-2 text-sm">{description}</p>
        </motion.div>
    );
};

const DocumentListModal = ({
    isOpen,
    onClose,
    myDocumentsByType = { originals: [], translations: [] },
    roomDocuments = [],
    onAddToMeeting,
    onDownloadSelected,
    onDetachSelected,
    onDeleteDocument,
    initialMode = 'myDocs',
    meetingStatus = 'SCHEDULED',
}) => {
    const [mode, setMode] = useState(initialMode);
    const [subTab, setSubTab] = useState('originals'); // 'originals' | 'translations' | 'all'
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const originals = myDocumentsByType.originals || [];
    const translations = myDocumentsByType.translations || [];

    const allMerged = useMemo(() => {
        const o = originals.map((d) => ({ ...d, _uid: `o:${d.id}`, __kind: 'originals' }));
        const t = translations.map((d) => ({ ...d, _uid: `t:${d.id}`, __kind: 'translations' }));
        return [...o, ...t];
    }, [originals, translations]);

    const documents = useMemo(() => {
        if (mode === 'myDocs') {
            if (subTab === 'originals') return originals.map((d) => ({ ...d, _uid: `o:${d.id}`, __kind: 'originals' }));
            if (subTab === 'translations') return translations.map((d) => ({ ...d, _uid: `t:${d.id}`, __kind: 'translations' }));
            return allMerged;
        }
        // 회의 문서는 서버 doc_type 대신 trans_doc_id 존재로 번역 구분, doc_type은 UI 표준화된 값 사용
        return (roomDocuments || []).map((d) => {
            const isTrans = d.doc_type === 'TRANSLATION' || !!d.trans_doc_id;
            return { ...d, doc_type: isTrans ? 'TRANSLATION' : 'ORIGINAL', _uid: `r:${d.id}`, __kind: 'room' };
        });
    }, [mode, subTab, originals, translations, allMerged, roomDocuments]);

    const filteredDocuments = useMemo(() => documents.filter((doc) => ((doc.title ?? doc.name) || '').toLowerCase().includes(searchTerm.toLowerCase())), [documents, searchTerm]);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setSubTab('originals');
            setSelectedIds(new Set());
            setSearchTerm('');
        }
    }, [isOpen, initialMode]);

    const handleSelect = (_uid) => {
        setSelectedIds((prev) => {
            const s = new Set(prev);
            s.has(_uid) ? s.delete(_uid) : s.add(_uid);
            return s;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredDocuments.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredDocuments.map((d) => d._uid)));
    };

    const isEnded = meetingStatus === 'ENDED';
    const isAllSelected = filteredDocuments.length > 0 && selectedIds.size === filteredDocuments.length;

    const handleConfirm = () => {
        if (mode === 'myDocs') {
            if (isEnded) return;

            const selectedDocs = filteredDocuments.filter((d) => selectedIds.has(d._uid));

            if (subTab === 'originals') {
                const ids = selectedDocs.map((d) => d.id);
                onAddToMeeting?.(ids, 'originals');
                onClose();
                return;
            }
            if (subTab === 'translations') {
                const ids = selectedDocs.map((d) => d.id); // trans_doc_id
                onAddToMeeting?.(ids, 'translations');
                onClose();
                return;
            }

            // all
            const originalIds = selectedDocs.filter((d) => d.__kind === 'originals').map((d) => d.id);
            const transIds = selectedDocs.filter((d) => d.__kind === 'translations').map((d) => d.id);
            if (originalIds.length) onAddToMeeting?.(originalIds, 'originals');
            if (transIds.length) onAddToMeeting?.(transIds, 'translations');
            onClose();
            return;
        }

        // roomDocs: 다운로드
        const selectedRoomDocs = filteredDocuments.filter((d) => selectedIds.has(d._uid));
        onDownloadSelected?.(selectedRoomDocs);
        onClose();
    };

    const handleDetach = async () => {
        const ids = filteredDocuments.filter((d) => selectedIds.has(d._uid)).map((d) => d.id);
        if (ids.length === 0) return;
        await onDetachSelected?.(ids);
        setSelectedIds(new Set());
    };

    const MODES_CONFIG = {
        myDocs: { title: '내 문서 선택', icon: <UploadCloud size={20} />, actionText: '회의에 추가' },
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-50 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ height: '90vh', maxHeight: '720px' }}
                    >
                        {/* 헤더 */}
                        <header className="p-6 pb-0 flex-shrink-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-800">{title}</h2>
                                    <p className="text-sm text-zinc-500 mt-1">원문/번역을 구분하거나, 한 화면에서 함께 확인하세요.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* 상단 탭 */}
                            <div className="mt-6 flex gap-6 border-b border-zinc-200">
                                <TabButton isActive={mode === 'myDocs'} onClick={() => setMode('myDocs')}>
                                    내 문서
                                </TabButton>
                                <TabButton isActive={mode === 'roomDocs'} onClick={() => setMode('roomDocs')}>
                                    회의 문서
                                </TabButton>
                            </div>

                            {/* 내 문서 하위 탭 */}
                            {mode === 'myDocs' && (
                                <div className="mt-4 flex items-center gap-2">
                                    <SubTab isActive={subTab === 'originals'} onClick={() => setSubTab('originals')}>
                                        원문
                                    </SubTab>
                                    <SubTab isActive={subTab === 'translations'} onClick={() => setSubTab('translations')}>
                                        번역
                                    </SubTab>
                                    <SubTab isActive={subTab === 'all'} onClick={() => setSubTab('all')}>
                                        전체
                                    </SubTab>
                                </div>
                            )}
                        </header>

                        {/* 본문 */}
                        <main className="px-6 pt-4 flex-grow flex flex-col overflow-hidden">
                            <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
                                    <input
                                        type="text"
                                        placeholder="문서 이름으로 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-10 py-3 bg-white border-2 border-zinc-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-400"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                {filteredDocuments.length > 0 && (
                                    <button
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold bg-white border-2 border-zinc-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                                    >
                                        {isAllSelected ? <CircleDot size={18} className="text-indigo-600" /> : <Layers size={18} />}
                                        <span>{isAllSelected ? '전체 해제' : '전체 선택'}</span>
                                    </button>
                                )}
                            </div>

                            {/* ENDED 정보 */}
                            {mode === 'myDocs' && meetingStatus === 'ENDED' && (
                                <div className="mb-3 flex items-center gap-2 text-red-600 text-sm font-semibold">
                                    <LockIcon size={16} />
                                    종료된 회의에는 문서를 추가할 수 없습니다.
                                </div>
                            )}

                            <div className="flex-grow overflow-y-auto -mr-3 pr-3 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                                <AnimatePresence mode="wait">
                                    {filteredDocuments.length > 0 ? (
                                        <motion.ul
                                            key={`${mode}-${subTab}`}
                                            initial="hidden"
                                            animate="visible"
                                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                                            className="space-y-3 pb-2"
                                        >
                                            {filteredDocuments.map((doc) => (
                                                <DocumentItem
                                                    key={doc._uid}
                                                    doc={doc}
                                                    isSelected={selectedIds.has(doc._uid)}
                                                    onSelect={() => handleSelect(doc._uid)}
                                                    onDelete={mode === 'myDocs' ? onDeleteDocument : undefined}
                                                />
                                            ))}
                                        </motion.ul>
                                    ) : (
                                        <EmptyState key={`empty-${mode}-${subTab}`} mode={mode} isSearching={searchTerm.length > 0} />
                                    )}
                                </AnimatePresence>
                            </div>
                        </main>

                        {/* 푸터 */}
                        <footer className="p-6 border-t border-zinc-200 bg-white/70 backdrop-blur-xl flex-shrink-0">
                            <div className="flex flex-wrap gap-3 w-full items-center justify-between">
                                {selectedIds.size > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-medium text-zinc-600">
                                            <span className="font-bold text-indigo-600 text-base">{selectedIds.size}개</span> 항목 선택됨
                                        </p>
                                        <button onClick={() => setSelectedIds(new Set())} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-600 transition-colors">
                                            <Trash2 size={14} />
                                            <span>선택 해제</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-zinc-500">항목을 선택해주세요.</div>
                                )}

                                <div className="flex items-center gap-2 ml-auto">
                                    {mode === 'roomDocs' && (
                                        <motion.button
                                            type="button"
                                            onClick={handleDetach}
                                            disabled={selectedIds.size === 0}
                                            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-red-600 border-2 border-red-300 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: selectedIds.size > 0 ? 1.03 : 1 }}
                                            whileTap={{ scale: selectedIds.size > 0 ? 0.98 : 1 }}
                                        >
                                            <Trash2 size={18} />
                                            해제
                                        </motion.button>
                                    )}

                                    <motion.button
                                        onClick={handleConfirm}
                                        disabled={selectedIds.size === 0 || (mode === 'myDocs' && meetingStatus === 'ENDED')}
                                        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-all duration-300 disabled:bg-zinc-300 disabled:shadow-none disabled:cursor-not-allowed"
                                        whileHover={{
                                            scale: selectedIds.size > 0 && !(mode === 'myDocs' && meetingStatus === 'ENDED') ? 1.05 : 1,
                                            y: selectedIds.size > 0 && !(mode === 'myDocs' && meetingStatus === 'ENDED') ? -3 : 0,
                                        }}
                                        whileTap={{ scale: selectedIds.size > 0 && !(mode === 'myDocs' && meetingStatus === 'ENDED') ? 0.98 : 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    >
                                        {icon}
                                        <span>{actionText}</span>
                                    </motion.button>
                                </div>
                            </div>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DocumentListModal;
