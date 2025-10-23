import React, { useCallback, useState } from 'react';
import { FilePlus2, FileText, UploadCloud, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2'; // This import is good for type-checking, but we'll stick to window.Swal per your code's pattern.

const FileUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState(''); // For validation errors

    const onDrop = useCallback(
        (acceptedFiles) => {
            const selectedFile = acceptedFiles[0];
            if (selectedFile) {
                setFile(selectedFile);
                if (!fileName) {
                    const nameWithoutExtension = selectedFile.name.split('.').slice(0, -1).join('.');
                    setFileName(nameWithoutExtension || selectedFile.name);
                }
                setMessage('');
            }
        },
        [fileName],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    // Reset state when modal closes
    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setFileName('');
            setFile(null);
            setUploadProgress(0);
            setMessage('');
        }, 300); // Wait for fade-out animation
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        if (!fileName || !file) {
            setMessage('문서 이름과 파일을 모두 선택해주세요.');
            return;
        }

        setUploadProgress(10); // Start progress

        // Simulate upload
        let progress = 10;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                setUploadProgress(100);
                clearInterval(interval);

                // --- NEW: 성공 또는 실패 시뮬레이션 ---
                const didFail = Math.random() < 0.3; // 30% 확률로 실패 시연

                if (didFail) {
                    // --- 실패 케이스 ---
                    setUploadProgress(0); // 진행률 표시줄 리셋

                    if (Swal) {
                        Swal.fire({
                            icon: 'error',
                            title: '업로드 실패',
                            text: '파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.',
                            confirmButtonColor: '#d33',
                            confirmButtonText: '확인',
                        });
                    } else {
                        // SweetAlert2 스크립트가 로드되지 않았을 경우의 폴백
                        console.error('업로드 실패: 파일 업로드 중 오류가 발생했습니다.');
                        setMessage('업로드 실패: 파일 업로드 중 오류가 발생했습니다.'); // Show message in modal
                    }
                    // 모달을 닫지 않고, 사용자가 재시도하거나 취소할 수 있도록 함.
                } else {
                    // --- 성공 케이스 (기존 로직) ---
                    // 부모 컴포넌트에 알림
                    onUploadSuccess({ fileName, file });

                    // SweetAlert2 성공 메시지 표시
                    if (Swal) {
                        Swal.fire({
                            icon: 'success',
                            title: '업로드 완료!',
                            text: `'${fileName}' 문서가 성공적으로 등록되었습니다.`,
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        }).then(() => {
                            // 알림 후 모달 닫기
                            handleClose();
                        });
                    } else {
                        // 스크립트가 로드되지 않았을 경우의 폴백 (예: 네트워크 오류)
                        console.log('업로드 완료!', `'${fileName}' 문서가 성공적으로 등록되었습니다.`);
                        // 알림 후 모달 닫기
                        handleClose();
                    }
                }
            } else {
                setUploadProgress(progress);
            }
        }, 200);
    };

    if (!isOpen) {
        return null;
    }

    return (
        // Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 transition-opacity duration-300 backdrop-blur-sm" onClick={handleClose}>
            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 sm:p-10 relative transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                    <X size={24} />
                </button>

                {/* Header with Icon */}
                <div className="mb-6 text-center">
                    <div className="flex justify-center items-center mb-4">
                        <div className="p-3 bg-violet-100 rounded-full">
                            <FilePlus2 size={28} className="text-violet-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">새 문서 등록</h2>
                    <p className="text-sm text-gray-500 mt-1">업로드할 파일의 이름과 파일을 선택하세요.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Document Name Input */}
                    <div>
                        <label htmlFor="fileName" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            문서 이름
                        </label>
                        <input
                            id="fileName"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="문서명을 입력하세요"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition shadow-sm bg-white text-gray-900"
                            required
                        />
                    </div>

                    {/* Drag & Drop Zone */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">파일 첨부</label>
                        <div
                            {...getRootProps()}
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
                                file ? 'border-violet-400 bg-violet-50' : isDragActive ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-500/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="text-center">
                                    <FileText className="text-violet-600 mx-auto" size={40} />
                                    <p className="text-sm font-medium text-gray-800 mt-2">{file.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                    <p className="text-xs text-violet-600 font-medium mt-2">파일을 다시 선택하려면 클릭하세요.</p>
                                </div>
                            ) : isDragActive ? (
                                <div className="text-center text-violet-600">
                                    <UploadCloud className="mx-auto animate-bounce" size={40} />
                                    <p className="text-sm font-semibold mt-2">여기에 파일을 놓으세요!</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <UploadCloud className="mx-auto" size={40} />
                                    <p className="text-sm font-semibold mt-3">파일을 드래그 앤 드롭하세요</p>
                                    <p className="text-xs mt-1">또는 클릭하여 파일 선택</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages & Progress Bar */}
                    {(uploadProgress > 0 || message) && (
                        <div className="mt-2 space-y-2">
                            {uploadProgress > 0 && (
                                <div>
                                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                                        <span>{uploadProgress === 100 ? '완료!' : '업로드 중...'}</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                                                // Change color on success (or failure if you kept progress at 100)
                                                uploadProgress === 100 ? 'bg-green-500' : 'bg-violet-600'
                                            }`}
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            {message && <p className="text-sm font-medium text-center py-2 px-3 rounded-lg text-red-800 bg-red-100">{message}</p>}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploadProgress > 0 && uploadProgress < 100}
                        className="w-full bg-violet-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-violet-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none mt-3 text-base transform hover:scale-[1.02]"
                    >
                        {uploadProgress > 0 && uploadProgress < 100 ? '업로드 중...' : '문서 업로드'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FileUploadModal;
