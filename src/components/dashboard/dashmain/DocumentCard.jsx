import React from 'react';
import { Link } from 'react-router-dom';

const DocumentItem = ({ title, date, from, to }) => (
  <div className="flex items-start py-4 border-b border-slate-100 last:border-b-0">
     <div className="bg-slate-100 p-2.5 rounded-lg mr-4 mt-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    </div>
    <div>
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="text-sm text-slate-500">{date}</p>
      <p className="text-sm text-slate-500 mt-1">원문: {from} → {to}</p>
    </div>
  </div>
);

const DocumentCard = () => {
  const documents = [
    { title: '2025 Q3 사업 계획서', date: '2025-09-28', from: '한국어', to: '영어' },
    { title: '파트너십 계약서', date: '2025-09-27', from: '영어', to: '한국어' },
    { title: '기술 스펙 문서', date: '2025-09-25', from: '일본어', to: '한국어' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-slate-800">최근 문서</h2>
        <Link 
  to="/dashboardhome/DashDocuments"
  className="text-sm text-indigo-600 font-semibold hover:underline"
>
  전체보기
</Link>
      </div>
      <div className="mt-4">
        {documents.map((doc, index) => (
          <DocumentItem key={index} {...doc} />
        ))}
      </div>
    </div>
  );
};

export default DocumentCard;