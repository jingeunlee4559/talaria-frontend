import React from 'react';

// 아이콘 컴포넌트들
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-500"><path fillRule="evenodd" d="M4.5 3.001a.75.75 0 00-1.036.606l-1.5 10.5a.75.75 0 00.606 1.036h16.86a.75.75 0 00.606-1.036l-1.5-10.5a.75.75 0 00-1.036-.606H4.5zM12 5.25a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3zM15 6a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0115 6zM8.25 6.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" clipRule="evenodd" /><path d="M3 19.5a3 3 0 003 3h12a3 3 0 003-3v-6H3v6z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-500"><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.134-.662 1.456 0l1.868 3.844 4.251.618c.732.107 1.026.997.494 1.503l-3.076 2.998.726 4.234c.125.728-.638 1.283-1.296.952L10 17.64l-3.844 2.02c-.658.332-1.42-.224-1.296-.952l.726-4.234L2.51 8.847c-.532-.506-.238-1.396.494-1.503l4.25-.618 1.868-3.844z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const MoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>;

const DocumentItem = ({ title, isStarred, fromLang, toLang, date, size, author }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
      <div className="flex items-center">
        {/* 아이콘 */}
        <div className="mr-4">
          <DocumentIcon />
        </div>
        
        {/* 정보 */}
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-800">{title}</h3>
            {isStarred && <StarIcon />}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            <span>{fromLang} → {toLang}</span>
            <span className="mx-2">・</span>
            <span>{date}</span>
            <span className="mx-2">・</span>
            <span>{size}</span>
            <span className="mx-2">・</span>
            <span>{author}</span>
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center space-x-2 text-slate-500">
        <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <DownloadIcon />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <MoreIcon />
        </button>
      </div>
    </div>
  );
};

export default DocumentItem;