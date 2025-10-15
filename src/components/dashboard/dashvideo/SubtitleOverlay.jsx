import { useDataChannel } from "@livekit/components-react";
import { useEffect, useState } from "react";

const SubtitleOverlay = () => {
  const [latestMessage, setLatestMessage] = useState(null);
  const { message } = useDataChannel('translation_data');

  useEffect(() => {
    if (message) {
      try {
        const textDecoder = new TextDecoder();
        const msg = JSON.parse(textDecoder.decode(message.payload));
        if (msg.type === 'translation') {
          setLatestMessage(msg);
        }
      } catch (error) {
        console.error('Failed to parse subtitle message:', error);
      }
    }
  }, [message]);

  if (!latestMessage) return null;

  return (
    <div className="absolute bottom-4 md:bottom-20 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 max-w-4xl bg-black/60 text-white p-3 md:p-4 rounded-lg text-center backdrop-blur-sm transition-all">
      <p className="font-bold text-base md:text-lg">{latestMessage.speakerName} ({latestMessage.langFrom})</p>
      <p className="text-lg md:text-xl my-1">{latestMessage.originalText}</p>
      <p className="text-base md:text-lg text-sky-300">{latestMessage.translatedText}</p>
    </div>
  );
};

export default SubtitleOverlay;