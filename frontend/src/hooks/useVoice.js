import { useEffect, useState, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const useVoice = () => {
  const { settings } = useContext(AppContext);
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSupported(true);
    }
  }, []);

  // Helper to select the correct voice
  const getVoice = useCallback((lang) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    if (lang === 'kn') {
      // Look for Kannada voice
      const knVoice = voices.find(v => v.lang.toLowerCase().includes('kn-in') || v.lang.toLowerCase().includes('kn'));
      if (knVoice) return knVoice;
    }
    
    // Default to friendly English voice
    const enVoice = voices.find(v => 
      v.lang.toLowerCase().includes('en-us') || 
      v.lang.toLowerCase().includes('en-gb') || 
      v.lang.toLowerCase().includes('en-in')
    );
    return enVoice || null;
  }, []);

  // Text-To-Speech function
  const speak = useCallback((text, force = false, onEndCallback = null) => {
    if (!supported || typeof window === 'undefined') {
      if (onEndCallback) onEndCallback();
      return;
    }
    
    // Respect user volume settings
    if (settings.voiceVolume === 'muted' && !force) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice(settings.language);
    utterance.lang = settings.language === 'kn' ? 'kn-IN' : 'en-US';
    
    // Speech Rate/Volume based on user settings
    utterance.rate = 0.85; // Speak slightly slower for elderly users
    
    if (settings.voiceVolume === 'soft') utterance.volume = 0.5;
    else if (settings.voiceVolume === 'loud') utterance.volume = 1.0;
    else utterance.volume = 0.8; // normal

    if (onEndCallback) {
      utterance.onend = () => onEndCallback();
      utterance.onerror = () => onEndCallback();
    }

    window.speechSynthesis.speak(utterance);
  }, [supported, settings.voiceVolume, settings.language, getVoice]);

  // Voice Command Listener
  const listen = useCallback((onCommandRecognized) => {
    if (!supported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = settings.language === 'kn' ? 'kn-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      setSpeechText(command);
      setIsListening(false);
      
      // Process voice commands
      let understood = false;

      // English Command Processing
      if (settings.language === 'en') {
        // Voice Call Command Parser
        const isCallCommand = command.startsWith('call ') || command.includes(' call ') || command.includes('phone') || command.includes('dial');
        
        if (isCallCommand) {
          let memberId = null;
          let memberName = '';
          if (command.includes('raghavendra') || command.includes('vijay') || command.includes('son') || command.includes('caregiver')) {
            memberId = 'seed-fam-1';
            memberName = 'Raghavendra';
          } else if (command.includes('deepa') || command.includes('daughter')) {
            memberId = 'seed-fam-2';
            memberName = 'Deepa';
          } else if (command.includes('savitha') || command.includes('wife')) {
            memberId = 'seed-fam-3';
            memberName = 'Savitha';
          } else if (command.includes('anand') || command.includes('doctor')) {
            memberId = 'seed-fam-4';
            memberName = 'Dr. Anand';
          }
          
          if (memberId) {
            speak(`Calling ${memberName}`, true);
            navigate('/family', { state: { autoCallMemberId: memberId } });
            understood = true;
          }
        }

        if (!understood && (command.startsWith('call') || command.includes('phone') || command.includes('dial'))) {
          speak("Opening Family Memories to place a call", true);
          navigate('/family');
          understood = true;
        }

        if (!understood) {
          if (command.includes('home') || command.includes('dashboard')) {
            speak("Going to Home Dashboard");
            navigate('/');
            understood = true;
          } else if (command.includes('reminder') || command.includes('task') || command.includes('schedule')) {
            speak("Opening Reminders");
            navigate('/reminders');
            understood = true;
          } else if (command.includes('family') || command.includes('photo') || command.includes('daughter') || command.includes('son') || command.includes('doctor')) {
            speak("Opening Family Memories");
            navigate('/family');
            understood = true;
          } else if (command.includes('game') || command.includes('brain') || command.includes('play')) {
            speak("Opening Brain Activity Games");
            navigate('/brain');
            understood = true;
          } else if (command.includes('emergency') || command.includes('sos') || command.includes('help') || command.includes('hospital')) {
            speak("Opening Emergency Page");
            navigate('/emergency');
            understood = true;
          } else if (command.includes('profile') || command.includes('setting')) {
            speak("Opening Profile Settings");
            navigate('/profile');
            understood = true;
          } else if (command.includes('caregiver') || command.includes('portal')) {
            speak("Opening Caregiver Dashboard");
            navigate('/caregiver');
            understood = true;
          }
        }
      } 
      // Kannada Command Processing
      else {
        // Voice Call Command Parser
        const isKnCallCommand = command.includes('ಕರೆ') || command.includes('ಫೋನ್') || command.includes('ಕಾಲ್') || command.includes('ದೂರವಾಣಿ');
        if (isKnCallCommand) {
          let memberId = null;
          let memberName = '';
          if (command.includes('ರಾಘವೇಂದ್ರ') || command.includes('ವಿಜಯ್') || command.includes('ಮಗ') || command.includes('ಪಾಲಕ')) {
            memberId = 'seed-fam-1';
            memberName = 'ರಾಘವೇಂದ್ರ';
          } else if (command.includes('ದೀಪಾ') || command.includes('ಮಗಳು')) {
            memberId = 'seed-fam-2';
            memberName = 'ದೀಪಾ';
          } else if (command.includes('ಸವಿತಾ') || command.includes('ಪತ್ನಿ')) {
            memberId = 'seed-fam-3';
            memberName = 'ಸವಿತಾ';
          } else if (command.includes('ಆನಂದ್') || command.includes('ಡಾಕ್ಟರ್')) {
            memberId = 'seed-fam-4';
            memberName = 'ಡಾಕ್ಟರ್ ಆನಂದ್';
          }

          if (memberId) {
            speak(`${memberName} ಅವರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ`, true);
            navigate('/family', { state: { autoCallMemberId: memberId } });
            understood = true;
          }
        }

        if (!understood && (command.includes('ಕರೆ') || command.includes('ಫೋನ್') || command.includes('ಕಾಲ್') || command.includes('ದೂರವಾಣಿ'))) {
          speak("ಕರೆ ಮಾಡಲು ಕುಟುಂಬದ ನೆನಪುಗಳ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿರುವೆ", true);
          navigate('/family');
          understood = true;
        }

        if (!understood) {
          if (command.includes('ಮನೆ') || command.includes('ಹೋಮ್') || command.includes('ಮುಖಪುಟ')) {
            speak("ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿರುವೆ");
            navigate('/');
            understood = true;
          } else if (command.includes('ಜ್ಞಾಪನೆ') || command.includes('ಕೆಲಸ') || command.includes('ಔಷಧಿ')) {
            speak("ಜ್ಞಾಪನೆಗಳನ್ನು ತೆರೆಯುತ್ತಿರುವೆ");
            navigate('/reminders');
            understood = true;
          } else if (command.includes('ಕುಟುಂಬ') || command.includes('ಮಗಳು') || command.includes('ಮಗ') || command.includes('ಪತ್ನಿ') || command.includes('ಫೋಟೋ')) {
            speak("ಕುಟುಂಬದ ನೆನಪುಗಳನ್ನು ತೆರೆಯುತ್ತಿರುವೆ");
            navigate('/family');
            understood = true;
          } else if (command.includes('ಆಟ') || command.includes('ಆಟವಾಡು')) {
            speak("ಮೆದುಳಿನ ಆಟಗಳನ್ನು ತೆರೆಯುತ್ತಿರುವೆ");
            navigate('/brain');
            understood = true;
          } else if (command.includes('ತುರ್ತು') || command.includes('ಸಹಾಯ') || command.includes('ಕಾಪಾಡಿ')) {
            speak("ತುರ್ತು ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿರುವೆ");
            navigate('/emergency');
            understood = true;
          } else if (command.includes('ಮಾಹಿತಿ') || command.includes('ಪ್ರೊಫೈಲ್') || command.includes('ಸೆಟ್ಟಿಂಗ್ಸ್')) {
            speak("ಪ್ರೊಫೈಲ್ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿರುವೆ");
            navigate('/profile');
            understood = true;
          } else if (command.includes('ಪಾಲಕರು') || command.includes('ಪಾಲಕ')) {
            speak("ಪಾಲಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿರುವೆ");
            navigate('/caregiver');
            understood = true;
          }
        }
      }

      if (onCommandRecognized) {
        onCommandRecognized(command, understood);
      }

      if (!understood) {
        const repeatMsg = settings.language === 'kn' 
          ? `ಕ್ಷಮಿಸಿ, '${command}' ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.` 
          : `Sorry, I did not understand '${command}'.`;
        speak(repeatMsg);
      }
    };

    const startMsg = settings.language === 'kn' ? "ಹೇಳಿ, ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ" : "I am listening";
    speak(startMsg, true, () => {
      try {
        recognition.start();
      } catch (err) {
        console.error("SpeechRecognition start error:", err);
      }
    });
  }, [supported, settings.language, navigate, speak]);

  // Load voices list
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
  }, []);

  return {
    supported,
    speak,
    listen,
    isListening,
    speechText
  };
};
