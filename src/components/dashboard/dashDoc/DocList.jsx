import DocumentItem from './DocumentItem';
import MeetingMinutesItem from './MeetingMinutesItem';

export const DocumentList = ({ documents, onItemClick, onSelect, selectedDocs }) => (
    <div className="space-y-3">
        {documents.map((doc) => (
            <DocumentItem key={doc.id} {...doc} onClick={onItemClick} onSelect={onSelect} isSelected={selectedDocs.includes(doc.id)} />
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
