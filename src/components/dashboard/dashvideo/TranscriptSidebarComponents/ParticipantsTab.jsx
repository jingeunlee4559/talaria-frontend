// src/components/sidebar/ParticipantsTab.jsx
import React from 'react';
import { getParticipantNickname } from './TranscriptSidebarUtils';


const MutedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <path d="M11.5 5.5a5 5 0 0 0-5 5v2" />
        <path d="M15.5 10.5a5 5 0 0 1-5 5" />
        <path d="m2 2 20 20" />
        <path d="M17 10.5V11a5 5 0 0 1-4.24 4.95" />
        <path d="M8.5 8.5a5 5 0 0 0 5 5" />
    </svg>
);

const ParticipantsTab = ({ localParticipant, remoteParticipants, room }) => {
    const allParticipants = [localParticipant, ...remoteParticipants].filter(Boolean);

    return (
        <div className="space-y-2">
            {allParticipants.map((p) => (
                <div
                    key={p.sid}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#3A425A]/60 border border-transparent hover:border-gray-600/80 transition-colors duration-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={`https://i.pravatar.cc/44?u=${p.identity}`} alt="avatar" className="w-11 h-11 rounded-full" />
                            {p.isSpeaking && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#2C3349] animate-pulse"></div>
                            )}
                        </div>
                        <span className="font-semibold text-gray-200">{getParticipantNickname(p, room)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {!p.isCameraEnabled && <MutedIcon />}
                        {p.isLocal && <span className="text-xs font-bold text-green-300 bg-green-500/20 px-3 py-1 rounded-full">나</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ParticipantsTab;