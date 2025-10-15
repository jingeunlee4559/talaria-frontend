import { useDataChannel } from "@livekit/components-react";
import { useEffect } from "react";

const DataSender = () => {
  const { send } = useDataChannel('translation_data');
  
    const mockTranscripts = [
  { type: 'translation', speakerName: 'John Smith', originalText: 'I think we should focus on the Asian market first.', translatedText: '먼저 아시아 시장에 집중해야 한다고 생각합니다.', langFrom: '영어', langTo: '한국어', time: '14:23' },
  { type: 'translation', speakerName: '김민수', originalText: '동의합니다. 특히 일본과 중국 시장이 유망해 보입니다.', translatedText: 'I agree. The Japanese and Chinese markets look promising.', langFrom: '한국어', langTo: '영어', time: '14:24' },
  { type: 'chat', sender: '田中', text: '회의 끝나고 자료 공유 부탁드립니다!', time: '14:25' },
];    

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (send) {
        const textEncoder = new TextEncoder();
        send(textEncoder.encode(JSON.stringify(mockTranscripts[index % mockTranscripts.length])));
        index++;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [send]);
  return null;
};

export default DataSender;


