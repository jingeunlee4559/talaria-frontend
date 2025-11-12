import React from 'react';
import DocumentItem from './DocumentItem';
import MeetingMinutesItem from './MeetingMinutesItem';

export const DocumentList = ({ userId, documents, onItemClick, onSelect, selectedDocs, onRagChange }) => (
    <div className="space-y-3">
        {documents.map((doc) => (
            <DocumentItem key={doc.id} userId={userId} {...doc} onClick={onItemClick} onSelect={onSelect} isSelected={selectedDocs.includes(doc.id)} onRagChange={onRagChange} />
        ))}
    </div>
);

export const MeetingMinutesList = ({ minutes, onItemClick }) => (
    <div className="space-y-3">
        {minutes.map((minute) => (
            <MeetingMinutesItem key={minute.id} {...minute} onClick={onItemClick} />
        ))}
    </div>
);
