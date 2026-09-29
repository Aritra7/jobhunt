import React, { useEffect, useRef, useState } from 'react';

/**
 * Records a spoken answer with the microphone so the user can play it back.
 * Recordings stay in memory for this tab only - nothing is uploaded or stored.
 */
export default function AnswerRecorder() {
  const [state, setState] = useState(/** @type {'idle' | 'recording' | 'unsupported' | 'denied'} */ (
    typeof window !== 'undefined' && 'MediaRecorder' in window && navigator.mediaDevices ? 'idle' : 'unsupported'));
  const [audioUrl, setAudioUrl] = useState('');
  const recorderRef = useRef(/** @type {MediaRecorder | null} */ (null));

  // Release the object URL when replaced/unmounted.
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  // Stop the mic if the component unmounts mid-recording.
  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === 'recording') recorder.stop();
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      /** @type {Blob[]} */
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType })));
        setState('idle');
      };
      recorderRef.current = recorder;
      recorder.start();
      setState('recording');
    } catch {
      setState('denied');
    }
  };

  const stop = () => recorderRef.current && recorderRef.current.stop();

  if (state === 'unsupported') return <p className="muted">Voice recording isn't supported in this browser.</p>;

  return (
    <div className="recorder">
      {state === 'recording' ? (
        <button type="button" className="secondary-button recording" onClick={stop}>■ Stop recording</button>
      ) : (
        <button type="button" className="secondary-button" onClick={start}>🎙 Record answer</button>
      )}
      {state === 'denied' && <span className="muted">Microphone access was blocked.</span>}
      {audioUrl && state !== 'recording' && (
        <audio controls src={audioUrl} />
      )}
      <span className="form-hint">Recordings stay in this tab only.</span>
    </div>
  );
}
