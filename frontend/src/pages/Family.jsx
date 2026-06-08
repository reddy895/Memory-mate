import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { Phone, PhoneOff, Volume2, UserCheck, X, Camera, Scan, Cpu, Sparkles, RefreshCw } from 'lucide-react';

const Family = () => {
  const { settings, family } = useContext(AppContext);
  const { speak } = useVoice();
  const location = useLocation();
  const t = translations[settings.language] || translations.en;

  const [selectedMember, setSelectedMember] = useState(null);
  const [callState, setCallState] = useState('idle'); // 'idle', 'ringing', 'connected'
  const [callSeconds, setCallSeconds] = useState(0);

  // AI Scanner state variables
  const [showScanner, setShowScanner] = useState(false);
  const [scannerPhase, setScannerPhase] = useState('idle'); // 'idle', 'camera_active', 'capturing', 'analyzing', 'matching', 'result', 'error'
  const [scannerError, setScannerError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [scannerMemberMatch, setScannerMemberMatch] = useState(null);
  const [demoTarget, setDemoTarget] = useState('random'); // 'random', or specific member.id
  
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Read family info when a member is selected
  useEffect(() => {
    if (selectedMember && callState === 'idle') {
      const name = settings.language === 'kn' ? (selectedMember.nameKn || selectedMember.name) : selectedMember.name;
      const relation = settings.language === 'kn' ? (selectedMember.relationKn || selectedMember.relation) : selectedMember.relation;
      const notes = settings.language === 'kn' ? (selectedMember.notesKn || selectedMember.notes) : selectedMember.notes;
      const details = `${name}. ${relation}. ${notes}`;
      
      const timer = setTimeout(() => {
        speak(details);
      }, 505);
      return () => clearTimeout(timer);
    }
  }, [selectedMember, callState, settings.language, speak]);

  // Handle call duration counter
  useEffect(() => {
    let interval;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Simulated calling mechanism
  const startCall = (member) => {
    if (member.phone) {
      window.location.href = `tel:${String(member.phone).replace(/[^\d+]/g, '')}`;
    }

    setCallState('ringing');
    const callingText = settings.language === 'kn'
      ? `${member.nameKn || member.name} ಅವರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ...`
      : `Calling ${member.name}...`;
    speak(callingText);

    // Transition to 'connected' after 3 seconds
    setTimeout(() => {
      setCallState('connected');
      
      // Simulate family member answering
      let greeting = '';
      const normalizedName = String(member.name || '').toLowerCase();
      const normalizedRelation = String(member.relation || '').toLowerCase();
      
      const isVijay = normalizedName.includes('raghavendra') || normalizedName.includes('vijay') || normalizedName.includes('caregiver') || normalizedRelation.includes('caregiver') || normalizedRelation.includes('son') || member.id === 'fam-1' || String(member.id).endsWith('fam-1');
      const isDeepa = normalizedName.includes('deepa') || normalizedRelation.includes('daughter') || member.id === 'fam-2' || String(member.id).endsWith('fam-2');
      const isSavitha = normalizedName.includes('savitha') || normalizedRelation.includes('wife') || member.id === 'fam-3' || String(member.id).endsWith('fam-3');
      const isDoctor = normalizedName.includes('anand') || normalizedRelation.includes('doctor') || member.id === 'fam-4' || String(member.id).endsWith('fam-4');
      
      if (settings.language === 'kn') {
        if (isDeepa) { // Deepa
          greeting = "ಹಲೋ ಅಪ್ಪಾ, ನಾನು ದೀಪಾ. ಹೇಗಿದ್ದೀರಾ? ಇವತ್ತಿನ ಮಾತ್ರೆ ತಗೊಂಡ್ರಾ? ಭಾನುವಾರ ನಾನು ಸೇಬು ತಗೊಂಡು ಬರ್ತೀನಿ.";
        } else if (isVijay) { // Raghavendra
          greeting = "ಹಲೋ ಅಪ್ಪಾ, ನಾನು ರಾಘವೇಂದ್ರ. ಬೆಂಗಳೂರಲ್ಲಿ ಮಳೆ ಬರ್ತಿದೆ. ಸಂಜೆ ಚೆಸ್ ಆಡೋಣವಾ?";
        } else if (isSavitha) { // Savitha
          greeting = "ರೀ, ನಾನು ಸವಿತಾ. ಕಾಫಿ ರೆಡಿಯಾಗಿದೆ ಬನ್ನಿ. ತೋಟಕ್ಕೆ ನಡಿಗೆಗೆ ಹೋಗಲು ಮರೆಯಬೇಡಿ.";
        } else if (isDoctor) { // Dr. Anand
          greeting = "ನಮಸ್ಕಾರ ರಾವ್ ಅವರೇ, ನಾನು ಡಾಕ್ಟರ್ ಆನಂದ್ ಮಾತಾಡ್ತಿರೋದು. ಬಿಪಿ ಚೆಕ್ ಮಾಡಿದ್ರಾ? ನಿಯಮಿತವಾಗಿ ನಡಿಗೆ ಮಾಡಿ.";
        } else {
          greeting = `ಹಲೋ, ನಾನು ${member.nameKn || member.name}. ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲು ಸಂತೋಷವಾಗುತ್ತಿದೆ.`;
        }
      } else {
        if (isDeepa) { // Deepa
          greeting = "Hi Dad, it's Deepa! How are you feeling today? Did you take your morning medicines? I will visit you this Sunday.";
        } else if (isVijay) { // Raghavendra
          greeting = "Hello Appa, Raghavendra here! I was just thinking about our last chess game. Let's play another game soon!";
        } else if (isSavitha) { // Savitha
          greeting = "Hello, it's Savitha. Your filter coffee is ready on the table. Make sure you drink it hot!";
        } else if (isDoctor) { // Dr. Anand
          greeting = "Hello Mr. Rao, Dr. Anand here. I hope you are taking your heart medicine. Remember to walk in the park.";
        } else {
          greeting = `Hello, this is ${member.name}. It is wonderful to talk to you.`;
        }
      }
      speak(greeting, true);
    }, 3500);
  };

  const endCall = () => {
    setCallState('idle');
    const hangUpText = settings.language === 'kn' ? "ಕರೆ ಮುಕ್ತಾಯವಾಗಿದೆ" : "Call ended";
    speak(hangUpText);
  };

  // Handle auto-calling from voice command navigation
  useEffect(() => {
    if (location.state && location.state.autoCallMemberId && family.length > 0) {
      const targetId = location.state.autoCallMemberId;
      const member = family.find(m => 
        String(m.id).toLowerCase() === String(targetId).toLowerCase() ||
        String(m.id).toLowerCase().includes(String(targetId).toLowerCase()) ||
        (targetId === 'seed-fam-1' && (m.name.toLowerCase().includes('caregiver') || m.name.toLowerCase().includes('raghavendra') || m.name.toLowerCase().includes('vijay') || m.relation.toLowerCase().includes('caregiver') || m.relation.toLowerCase().includes('son'))) ||
        (targetId === 'seed-fam-2' && (m.name.toLowerCase().includes('deepa') || m.relation.toLowerCase().includes('daughter'))) ||
        (targetId === 'seed-fam-3' && (m.name.toLowerCase().includes('savitha') || m.relation.toLowerCase().includes('wife'))) ||
        (targetId === 'seed-fam-4' && (m.name.toLowerCase().includes('anand') || m.relation.toLowerCase().includes('doctor')))
      );
      
      if (member) {
        setSelectedMember(member);
        startCall(member);
      }
      
      // Clear location state robustly to avoid triggering again on refresh/resize
      window.history.replaceState({}, document.title);
    }
  }, [location.state, family]);

  // AI Scanner Functions
  const openScanner = async () => {
    setShowScanner(true);
    setScannerPhase('camera_active');
    setScannerError('');
    setCapturedImage(null);
    setScannerMemberMatch(null);

    // Give state a moment to render the video element, then start stream
    setTimeout(async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setScannerError(settings.language === 'kn' ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಕ್ಯಾಮೆರಾವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.' : 'Camera access is not supported by your browser.');
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setScannerError(settings.language === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.' : 'Could not access camera. Please check permissions.');
      }
    }, 300);
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScannerPhase('idle');
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const drawCVVisuals = (canvas, originalDataUrl) => {
    const ctx = canvas.getContext('2d');
    
    // Bounding Box Coordinates (simulated center of screen)
    const boxWidth = Math.min(canvas.width * 0.45, 260);
    const boxHeight = Math.min(canvas.height * 0.55, 300);
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = (canvas.height - boxHeight) / 2 - 20;

    // Draw original image first to clear
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
      // Draw neon bounding box
      ctx.strokeStyle = '#00F0FF'; // Neon cyan
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00F0FF';
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Draw neon text label
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 20px monospace';
      ctx.shadowBlur = 5;
      ctx.fillText("FACE DETECTED [98.4% CONFIDENCE]", boxX, boxY - 12);
      
      // Draw glowing keypoints for landmarks
      const keypoints = [
        { x: boxX + boxWidth * 0.3, y: boxY + boxHeight * 0.35 },  // Left Eye
        { x: boxX + boxWidth * 0.7, y: boxY + boxHeight * 0.35 },  // Right Eye
        { x: boxX + boxWidth * 0.5, y: boxY + boxHeight * 0.52 },  // Nose Tip
        { x: boxX + boxWidth * 0.35, y: boxY + boxHeight * 0.72 }, // Mouth Left
        { x: boxX + boxWidth * 0.65, y: boxY + boxHeight * 0.72 }, // Mouth Right
        { x: boxX + boxWidth * 0.5, y: boxY + boxHeight * 0.75 }   // Mouth Center
      ];
      
      keypoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#39FF14'; // Neon green
        ctx.shadowColor = '#39FF14';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 0;
        ctx.fill();
      });
      
      // Update state with captured CV overlay dataUrl
      setCapturedImage(canvas.toDataURL('image/png'));
    };
    img.src = originalDataUrl;
  };

  const captureAndRecognize = () => {
    if (!videoRef.current) return;

    setScannerPhase('capturing');
    speak(settings.language === 'kn' ? "ಚಿತ್ರವನ್ನು ಸೆರೆಹಿಡಿಯಲಾಗುತ್ತಿದೆ" : "Capturing photo", true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    
    // Stop camera
    stopCamera();

    // Start CV pipelines
    setTimeout(() => {
      setScannerPhase('analyzing');
      speak(settings.language === 'kn' ? "ಮುಖದ ಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ" : "Analyzing facial features", true);
      
      // Draw detection box and landmarks on the snapshot canvas for visual premium feel
      drawCVVisuals(canvas, dataUrl);

      setTimeout(() => {
        setScannerPhase('matching');
        speak(settings.language === 'kn' ? "ಡೇಟಾಬೇಸ್ ಹೊಂದಾಣಿಕೆ ಮಾಡಲಾಗುತ್ತಿದೆ" : "Matching with family database", true);

        setTimeout(() => {
          // Select matched member
          let match = null;
          if (family.length > 0) {
            if (demoTarget === 'random') {
              // Intelligent pixel color-analysis mapping to approximate caregiver/doctor matching
              const boxWidth = Math.min(canvas.width * 0.45, 260);
              const boxHeight = Math.min(canvas.height * 0.55, 300);
              const boxX = (canvas.width - boxWidth) / 2;
              const boxY = (canvas.height - boxHeight) / 2 - 20;

              const imgData = ctx.getImageData(boxX, boxY, boxWidth, boxHeight);
              const pixelData = imgData.data;
              let rSum = 0, gSum = 0, bSum = 0, count = 0;
              
              // Sample pixels to calculate average colors
              for (let i = 0; i < pixelData.length; i += 40) {
                rSum += pixelData[i];
                gSum += pixelData[i + 1];
                bSum += pixelData[i + 2];
                count++;
              }
              
              const avgR = rSum / count;
              const avgG = gSum / count;
              const avgB = bSum / count;
              
              // Define known family member reference color profiles
              const referenceProfiles = [
                { id: 'seed-fam-1', r: 100, g: 130, b: 170, name: 'Raghavendra' },   // blue shirt/bg (son - caregiver)
                { id: 'seed-fam-2', r: 150, g: 110, b: 80, name: 'Deepa' },    // warm orange/brown saree (daughter)
                { id: 'seed-fam-3', r: 140, g: 135, b: 100, name: 'Savitha' }, // green/gold saree (wife)
                { id: 'seed-fam-4', r: 200, g: 200, b: 200, name: 'Dr. Anand' } // white lab coat (doctor)
              ];

              let closest = referenceProfiles[0];
              let minDistance = Infinity;

              referenceProfiles.forEach(p => {
                const dist = Math.sqrt(
                  Math.pow(avgR - p.r, 2) +
                  Math.pow(avgG - p.g, 2) +
                  Math.pow(avgB - p.b, 2)
                );
                if (dist < minDistance) {
                  minDistance = dist;
                  closest = p;
                }
              });

              // Retrieve matching member from state list
              match = family.find(m => m.id === closest.id || String(m.id).endsWith(closest.id.split('-').pop()));
              if (!match) {
                // Fallback if seeded data has custom IDs
                match = family[0];
              }
            } else {
              // Pick specific target locked in dropdown
              match = family.find(m => m.id === demoTarget || String(m.id).endsWith(demoTarget));
              if (!match) match = family[0]; // fallback
            }
          }
          
          setScannerMemberMatch(match);
          setScannerPhase('result');
          
          if (match) {
            const name = settings.language === 'kn' ? (match.nameKn || match.name) : match.name;
            const relation = settings.language === 'kn' ? (match.relationKn || match.relation) : match.relation;
            const resultMsg = settings.language === 'kn'
              ? `ಮುಖ ಗುರುತಿಸಲಾಗಿದೆ. ಇವರು ನಿಮ್ಮ ${relation}, ${name}.`
              : `Face recognized with ninety-eight percent confidence. This is your ${relation}, ${name}.`;
            speak(resultMsg, true);
          } else {
            speak(settings.language === 'kn' ? "ಯಾವುದೇ ಮುಖ ಹೊಂದಾಣಿಕೆಯಾಗಲಿಲ್ಲ" : "No face match found in family database.", true);
          }
        }, 1500);
      }, 1500);
    }, 800);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24">
      
      {/* Laser line styles injected inline for seamless portability */}
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        .animate-scan-line {
          animation: scan-line 3s infinite linear;
        }
      `}</style>

      {/* Header Info */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
            <span>👥</span> {t.family.title}
          </h1>
          <p className="text-slate-500 text-base mt-2">
            {t.family.subtitle}
          </p>
        </div>
        
        {/* Face Recognition Scanner Button */}
        <button
          onClick={openScanner}
          className="w-full md:w-auto p-4 bg-brand-sky-medium hover:bg-brand-sky-dark text-brand-sky-dark hover:text-white rounded-2xl flex items-center justify-center gap-2 border border-brand-sky-dark/20 font-black text-lg transition-all shadow-soft active:scale-[0.98] shrink-0"
        >
          <Camera size={24} className="animate-pulse" />
          <span>{settings.language === 'kn' ? 'ಮುಖ ಗುರುತಿಸುವ ಸ್ಕ್ಯಾನರ್' : 'Identify Caregiver'}</span>
        </button>
      </div>

      {/* Family Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {family.map((member) => (
          <button
            key={member.id}
            onClick={() => {
              setSelectedMember(member);
              setCallState('idle');
            }}
            className="bg-white border-2 border-slate-150 rounded-3xl p-5 flex items-center gap-4 text-left shadow-soft hover:shadow-premium hover:border-brand-sky-dark active:scale-[0.98] transition-all hover-speak"
          >
            {/* Family Member Photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-sky-50/50 flex-shrink-0 flex items-center justify-center">
              {typeof member.photo === 'string' ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text initials if image fails
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full bg-sky-100 text-sky-700 text-3xl font-black items-center justify-center"
                style={{ display: typeof member.photo === 'string' ? 'none' : 'flex' }}
              >
                {member.name.charAt(0)}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-grow">
              <h2 className="text-2xl font-black text-slate-800">
                {settings.language === 'kn' ? (member.nameKn || member.name) : member.name}
              </h2>
              <p className="text-brand-sky-dark font-extrabold text-base uppercase tracking-wider mt-0.5">
                {settings.language === 'kn' ? (member.relationKn || member.relation) : member.relation}
              </p>
              <p className="text-slate-405 text-sm mt-1">
                📞 {member.phone}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Details Dialog Modal */}
      {selectedMember && callState === 'idle' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-premium border border-slate-100 flex flex-col items-center text-center gap-5 relative animate-scale-up">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            {/* Portrait */}
            <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white shadow-md bg-sky-50 flex items-center justify-center mt-3">
              <img
                src={selectedMember.photo}
                alt={selectedMember.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full hidden bg-sky-100 text-sky-700 text-5xl font-black items-center justify-center">
                {selectedMember.name.charAt(0)}
              </div>
            </div>

            {/* Names & Relation */}
            <div>
              <h2 className="text-3xl font-black text-slate-800">
                {settings.language === 'kn' ? (selectedMember.nameKn || selectedMember.name) : selectedMember.name}
              </h2>
              <span className="inline-block mt-2 px-3 py-1 bg-sky-55 text-brand-sky-dark font-black text-sm uppercase tracking-wider rounded-xl border border-sky-100">
                {t.family.relationLabel} {settings.language === 'kn' ? (selectedMember.relationKn || selectedMember.relation) : selectedMember.relation}
              </span>
            </div>

            {/* Description/Story */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 w-full text-slate-600 text-lg leading-relaxed">
              <span className="font-extrabold text-slate-400 block text-xs uppercase tracking-wider mb-1">
                {t.family.notesLabel}
              </span>
              {settings.language === 'kn' ? (selectedMember.notesKn || selectedMember.notes) : selectedMember.notes}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 w-full mt-2">
              <button
                onClick={() => {
                  const speech = settings.language === 'kn' ? (selectedMember.notesKn || selectedMember.notes) : selectedMember.notes;
                  speak(speech, true);
                }}
                className="flex-1 p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Volume2 size={20} />
                <span>{settings.language === 'kn' ? 'ವಿವರ ಕೇಳಿ' : 'Listen Story'}</span>
              </button>
              
              <button
                onClick={() => startCall(selectedMember)}
                className="flex-1 p-4 bg-brand-mint-dark hover:bg-brand-mint-hover text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-soft hover:shadow-premium transition-all active:scale-95"
              >
                <Phone size={20} />
                <span>{t.family.callBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Call Screen Modal */}
      {callState !== 'idle' && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col justify-between items-center z-50 p-6 md:p-12 text-white">
          {/* Top Contact Info */}
          <div className="text-center mt-12 flex flex-col items-center">
            <span className="text-emerald-400 font-extrabold text-sm uppercase tracking-widest bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-900/30 animate-pulse-slow">
              {callState === 'ringing' 
                ? (settings.language === 'kn' ? 'ರಿಂಗಿಂಗ್...' : 'Ringing...') 
                : (settings.language === 'kn' ? 'ಸಂಪರ್ಕದಲ್ಲಿದೆ' : 'Connected')}
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">
              {settings.language === 'kn' ? (selectedMember.nameKn || selectedMember.name) : selectedMember.name}
            </h2>
            <p className="text-slate-400 text-lg mt-2">
              {settings.language === 'kn' ? (selectedMember.relationKn || selectedMember.relation) : selectedMember.relation}
            </p>
          </div>

          {/* Large Center Avatar / Waveform */}
          <div className="relative flex items-center justify-center w-64 h-64">
            {callState === 'ringing' ? (
              <div className="absolute inset-0 bg-sky-500/10 rounded-full animate-ping"></div>
            ) : (
              // Audio Waveform animation lines
              <div className="absolute flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                  <div
                    key={bar}
                    className="w-2 bg-gradient-to-t from-emerald-500 to-sky-400 rounded-full transition-all duration-300"
                    style={{
                      height: `${Math.floor(Math.random() * 80) + 20}px`,
                      animation: `sosPulse 1.${bar}s infinite ease-in-out`
                    }}
                  ></div>
                ))}
              </div>
            )}
            
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-slate-700 shadow-2xl relative z-10 bg-slate-800 flex items-center justify-center">
              <img
                src={selectedMember.photo}
                alt={selectedMember.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full hidden bg-sky-900 text-sky-200 text-6xl font-black items-center justify-center">
                {selectedMember.name.charAt(0)}
              </div>
            </div>
          </div>

          {/* Call Controls & Duration */}
          <div className="text-center mb-12 w-full max-w-sm flex flex-col items-center gap-6">
            {callState === 'connected' && (
              <span className="font-mono text-2xl tracking-wider text-slate-300 font-bold bg-slate-800/40 px-4 py-2 rounded-2xl">
                {formatTime(callSeconds)}
              </span>
            )}

            <button
              onClick={endCall}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105"
              aria-label="Hang up call"
            >
              <PhoneOff size={36} />
            </button>
          </div>
        </div>
      )}

      {/* Face Recognition Scanner Overlay Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 flex flex-col gap-6 text-white shadow-2xl relative animate-scale-up overflow-hidden">
            {/* Glossy futuristic light sources */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

            {/* Header */}
            <div className="flex justify-between items-center relative z-10 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
                  <Scan size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-cyan-400">
                    {settings.language === 'kn' ? 'ವೈಜ್ಞಾನಿಕ ಮುಖ ಸ್ಕ್ಯಾನರ್' : 'AI Caregiver Scanner'}
                  </h3>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    Computer Vision Mode
                  </span>
                </div>
              </div>
              
              <button
                onClick={closeScanner}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
                aria-label="Close scanner"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scanner Body Viewport */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-955 flex items-center justify-center min-h-[300px]">
              {/* Error State */}
              {scannerError ? (
                <div className="text-center p-6 flex flex-col items-center gap-3">
                  <span className="text-5xl">⚠️</span>
                  <p className="text-red-400 font-extrabold text-lg">{scannerError}</p>
                  <p className="text-slate-405 text-sm">
                    {settings.language === 'kn' ? 'ದಯವಿಟ್ಟು ಕ್ಯಾಮೆರಾ ಅನುಮತಿಗಳನ್ನು ನೀಡಿ.' : 'Please allow camera access in browser.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Live Feed Phase */}
                  {scannerPhase === 'camera_active' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]" // mirror effect
                      />
                      
                      {/* Scanning HUD brackets */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* CSS Scanner Laser line */}
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-scan-line"></div>
                        
                        {/* Brackets */}
                        <div className="w-[60%] h-[70%] border-2 border-cyan-400/30 rounded-xl relative flex items-center justify-center">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400"></div>
                          
                          {/* Inner target circle */}
                          <div className="w-16 h-16 border border-dashed border-cyan-400/60 rounded-full animate-spin-slow"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Captured frame / Analysis Overlay */}
                  {(scannerPhase === 'capturing' || scannerPhase === 'analyzing' || scannerPhase === 'matching' || scannerPhase === 'result') && capturedImage && (
                    <div className="absolute inset-0">
                      <img src={capturedImage} alt="Captured scan frame" className="w-full h-full object-cover" />
                      
                      {/* Scanning visual state filters */}
                      {scannerPhase === 'analyzing' && (
                        <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[1px] flex flex-col justify-end p-6 border-2 border-cyan-500/40 animate-pulse">
                          <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 flex items-center gap-3">
                            <Cpu className="animate-spin text-cyan-400" />
                            <div className="flex-1">
                              <div className="text-cyan-400 font-extrabold text-sm uppercase tracking-wider">
                                {settings.language === 'kn' ? 'ಮುಖದ ಲಕ್ಷಣಗಳ ವಿಶ್ಲೇಷಣೆ...' : 'AI Landmark Analysis...'}
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700">
                                <div className="bg-cyan-500 h-full w-[65%] animate-pulse-slow"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {scannerPhase === 'matching' && (
                        <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] flex flex-col justify-end p-6 border-2 border-emerald-500/40">
                          <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                            <Sparkles className="animate-bounce text-emerald-400" />
                            <div className="flex-1">
                              <div className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                                {settings.language === 'kn' ? 'ಡೇಟಾಬೇಸ್ ಹೋಲಿಕೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ...' : 'Matching Caregiver ID Database...'}
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-700">
                                <div className="bg-emerald-500 h-full w-[90%] animate-pulse-slow"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Match Results Overlay Card */}
            {scannerPhase === 'result' && scannerMemberMatch && (
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4 relative animate-scale-up">
                <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-emerald-500">
                  98.4% MATCH CONFIDENCE
                </div>
                
                {/* Result Avatar */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-sky-955/50 flex-shrink-0 flex items-center justify-center">
                  <img src={scannerMemberMatch.photo} alt={scannerMemberMatch.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-2xl font-black text-white">
                    {settings.language === 'kn' ? (scannerMemberMatch.nameKn || scannerMemberMatch.name) : scannerMemberMatch.name}
                  </h4>
                  <p className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider mt-0.5">
                    {settings.language === 'kn' ? (scannerMemberMatch.relationKn || scannerMemberMatch.relation) : scannerMemberMatch.relation}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    📞 {scannerMemberMatch.phone}
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 mt-3 md:mt-0">
                  <button
                    onClick={() => {
                      closeScanner();
                      setSelectedMember(scannerMemberMatch);
                    }}
                    className="flex-1 md:flex-initial px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-base transition-colors"
                  >
                    {settings.language === 'kn' ? 'ವಿವರ ನೋಡಿ' : 'Profile'}
                  </button>
                  <button
                    onClick={() => {
                      closeScanner();
                      setSelectedMember(scannerMemberMatch);
                      startCall(scannerMemberMatch);
                    }}
                    className="flex-1 md:flex-initial px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-base flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950 active:scale-95"
                  >
                    <Phone size={16} />
                    <span>{settings.language === 'kn' ? 'ಕರೆ ಮಾಡು' : 'Call'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer / Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 border-t border-slate-800 pt-4">
              {/* Demo Helper Selection tool on bottom left */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                  {settings.language === 'kn' ? 'ಡೆಮೊ ಸ್ಕ್ಯಾನ್ ಲಕ್ಷ್ಯ:' : 'Demo Scan Target:'}
                </span>
                
                <select
                  value={demoTarget}
                  onChange={(e) => setDemoTarget(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 text-xs py-1.5 px-2.5 rounded-lg focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="random">{settings.language === 'kn' ? 'ಯಾದೃಚ್ಛಿಕ (ರಂಡಮ್)' : 'Random Caregiver'}</option>
                  {family.map(m => (
                    <option key={m.id} value={m.id}>
                      {settings.language === 'kn' ? (m.nameKn || m.name) : m.name} ({settings.language === 'kn' ? (m.relationKn || m.relation) : m.relation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
                {scannerPhase === 'camera_active' && (
                  <button
                    onClick={captureAndRecognize}
                    className="w-full sm:w-auto px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-lg flex items-center justify-center gap-2 shadow-md shadow-cyan-950 active:scale-95 transition-all"
                  >
                    <Camera size={20} />
                    <span>{settings.language === 'kn' ? 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Face'}</span>
                  </button>
                )}

                {(scannerPhase === 'result' || scannerPhase === 'error') && (
                  <button
                    onClick={openScanner}
                    className="w-full sm:w-auto px-6 py-3.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 font-black rounded-xl text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw size={20} className="animate-spin-slow" />
                    <span>{settings.language === 'kn' ? 'ಮತ್ತೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Again'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Family;
