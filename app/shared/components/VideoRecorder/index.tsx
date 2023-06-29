import {useState, useRef, useEffect} from 'react'

const mimeType = "video/webm";

const VideoRecorder = () => {
  const [userPermission, setUserPermission] = useState(false);
  const [vidStream, setVidStream] = useState<MediaStream | null>(null);
  const [recordingState, setRecordingState] = useState("inactive");
  const [vidChunks, setVidChunks] = useState<Blob[]>([]);
  const [recordedVid, setRecordedVid] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState("default");
  const [videoSource, setVideoSource] = useState("default");
  const [gotAccess, setGotAccess] = useState(false);
  const vidRecorder = useRef<MediaRecorder | null>(null);
  const liveFeed = useRef<HTMLVideoElement | null>(null);
  const audioSrcRef = useRef<HTMLSelectElement | null>(null);
  const videoSrcRef = useRef<HTMLSelectElement | null>(null);


  useEffect(() => {
    const setUserDevice = async () => {
      const userDevices = await navigator.mediaDevices.enumerateDevices()
        for(const userDevice of userDevices) {
          const option = document.createElement('option');
          option.value = userDevice.deviceId;
          if(userDevice.kind === 'audioinput') {
            option.text = userDevice.label || `Microphone ${audioSrcRef.current && audioSrcRef.current?.length + 1}`;
            audioSrcRef.current?.appendChild(option);
          }else if (userDevice.kind === 'videoinput') {
            option.text = userDevice.label || `Camera ${videoSrcRef.current && videoSrcRef.current.length + 1}`;
            videoSrcRef.current?.appendChild(option);
          }
        }
    }
    setUserDevice()
  }, [])

  const getUserPermission = async() => {
    setRecordedVid(null);
    if("MediaRecorder" in window) {
      try{
        const videoConstraints = {
          audio: false,
          video: { deviceId: videoSource ? {exact: videoSource} : undefined}
        }
        const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);

        const audioConstraints = {
          audio: {deviceId: audioSource ? { exact: audioSource} : undefined},
        }
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);

        setUserPermission(true);

        const dataStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);
        setVidStream(dataStream);
        if(liveFeed.current) liveFeed.current.srcObject = videoStream;

        
      }catch(err) {
        console.error(err)
      }
    } else {
      alert("Video recorder not supported")
    }
  }

  const startRecording = async () => {
    if(vidStream) {
      setRecordingState("recording");
      const media = new MediaRecorder(vidStream, {mimeType});
      vidRecorder.current = media;
      vidRecorder.current.start();
      let chunks: Blob[] = [];
      vidRecorder.current.ondataavailable = (e) => {
        if(typeof e.data === "undefined") return;
        if(e.data.size === 0) return;
        chunks.push(e.data);
      };
      setVidChunks(chunks);
    }
  }
  const stopRecording = () => {
    setUserPermission(false);
    setRecordingState("inactive");
    if(vidRecorder.current) {
      vidRecorder.current.stop();
      vidRecorder.current.onstop = () => {
        const vidBlob = new Blob(vidChunks, {type: mimeType});
        const vidUrl = URL.createObjectURL(vidBlob);
        setRecordedVid(vidUrl);
        setVidChunks([]);
      }
    } 
  }

  const handleReRecord = () => {
    window.location.reload()
    setUserPermission(false);
  }

  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <header>
        <h2 className='text-2xl'>Pivodio Recorder</h2>
      </header>
      <main className='flex flex-col justify-center items-center gap-8'>
        <div className="select-src flex flex-col md:flex-row gap-4">
          <div className="select-audio-src flex flex-col">
            <label htmlFor="audioSrc">Audio Source</label>
            <select onChange={(e) => setAudioSource(e.currentTarget.value)} id="audioSrc" ref={audioSrcRef} className='max-w-[250px]'>
              <option value="">--Audio Source</option>
            </select>
          </div>
          <div className="select-video-src flex flex-col">
            <label htmlFor="videoSrc">Video Source</label>
            <select onChange={(e) => setVideoSource(e.currentTarget.value)} id="videoSrc" ref={videoSrcRef}>
              <option value="">--Video Source</option>
            </select>
          </div>
        </div>
        <div className={`video-controls mb-5 ${recordedVid ? 'hidden' : ''}`}>
          {!userPermission && !recordedVid ? (
            <button className='bg-[#fcfd67] hover:bg-[#fffda7] p-3' onClick={getUserPermission}>
              Allow Camera Access
            </button>
          ): userPermission && recordingState === "inactive" ? (
            <div className='flex flex-row gap-4'>
              <button className='bg-[#fcfd67] hover:bg-[#fffda7] p-3' onClick={startRecording}>
                Start Recording
              </button>
              <button className='bg-[#fcfd67] hover:bg-[#fffda7] p-3' onClick={() =>window.location.reload()}>Cancel</button>
            </div>
          ) : userPermission && recordingState === "recording" ? (
            <button className='bg-[#fcfd67] hover:bg-[#fffda7] p-3' onClick={stopRecording}>
              Stop Recording
            </button>
          ): null}
        </div>
        <section className="video-output flex flex-col items-center justify-center outline-3 outline-[#fcfd67]">
          {!recordedVid ? (
            <video ref={liveFeed} autoPlay className='h-[200px] w-[400px] border-2 border-[#fcfd67]'></video>
          ) : recordedVid && (
            <div className="recorded-output flex flex-col justify-center items-center mb-8">
              <div className="button-group flex flex-row justify-center items-center gap-8 mb-8">
                <a className='bg-[#fcfd67] hover:bg-[#fffda7] p-3' download href={recordedVid}>
                  Download Your Video
                </a>
                <button onClick={handleReRecord}  className='bg-[#fcfd67] hover:bg-[#fffda7] p-3'>
                  Restart
                </button>
              </div>
              <video src={recordedVid} controls></video>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default VideoRecorder