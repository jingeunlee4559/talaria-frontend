import { useTracks, GridLayout, ParticipantTile } from '@livekit/components-react';
import { Track } from 'livekit-client';

function CustomVideoGrid() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    return (
        <GridLayout tracks={tracks} style={{ height: '100%' }}>
            <ParticipantTile />
        </GridLayout>
    );
}

export default CustomVideoGrid;
