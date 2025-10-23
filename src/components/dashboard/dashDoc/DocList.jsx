import DocumentItem from './DocumentItem';
import MeetingMinutesItem from './MeetingMinutesItem';

export const DocumentList = ({ documents, onItemClick }) => (
    <div className="space-y-3">
        {documents.map((doc) => (
            <DocumentItem key={doc.id} {...doc} onClick={onItemClick} />
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
