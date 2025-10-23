import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Radio, UsersRound, Video } from 'lucide-react';

const InProgressMeetingCard = ({ meeting, onJoinMeeting }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-green-300 overflow-hidden
                       flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4"
        >
            <div className="flex items-center gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                    <Radio className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5">
                            <UsersRound className="w-4 h-4" /> {meeting.participants}명 참여중
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> {meeting.time}
                        </span>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onJoinMeeting(meeting.id, meeting.title)}
                className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg text-base
                           hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
                <Video className="w-5 h-5" />
                <span>즉시 참여</span>
            </button>
        </motion.div>
    );
};

export default InProgressMeetingCard;
