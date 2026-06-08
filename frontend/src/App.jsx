import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import { useVoice } from './hooks/useVoice';
import { translations } from './utils/translations';
import logoImg from './assets/logo.png';

// Import Pages
import Dashboard from './pages/Dashboard';
import Reminders from './pages/Reminders';
import Family from './pages/Family';
import BrainGym from './pages/BrainGym';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import Caregiver from './pages/Caregiver';

// Import Icons
import { 
  Home, 
  Calendar, 
  Users, 
  Brain, 
  AlertTriangle, 
  User, 
  Lock, 
  Mic, 
  Volume2, 
  Globe, 
  Wifi, 
  Battery,
  AlertCircle,
  Menu,
  X,
  Phone,
  Settings
} from 'lucide-react';

function App() {
  const { settings, setSettings, reminders, getTodayStats } = useContext(AppContext);
  const { speak, listen, isListening, speechText, supported } = useVoice();
  const location = useLocation();
  const navigate = useNavigate();
  const t = translations[settings.language] || translations.en;

  // Real-time clock display
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [dayStr, setDayStr] = useState('');

  // Redesign: Navigation simplification & Drawer State
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);

  useEffect(() => {
    // Apply initial font size attribute
    document.documentElement.setAttribute('data-font-size', settings.fontSize);

    const updateClock = () => {
      const now = new Date();
      
      // Formatting time
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      
      // Formatting date and day of week based on active language
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      setDateStr(now.toLocaleDateString(settings.language === 'kn' ? 'kn-IN' : 'en-US', options));
      setDayStr(now.toLocaleDateString(settings.language === 'kn' ? 'kn-IN' : 'en-US', { weekday: 'long' }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [settings.language]);

  // Read welcoming TTS on first app mount
  useEffect(() => {
    const welcomeMsg = settings.language === 'kn' ? t.voice.welcomeTts : t.voice.welcomeTts;
    speak(welcomeMsg);
  }, []);

  const handleLanguageToggle = () => {
    const nextLang = settings.language === 'en' ? 'kn' : 'en';
    setSettings(prev => ({ ...prev, language: nextLang }));
    
    const speakFeedback = nextLang === 'kn' 
      ? "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ." 
      : "Language changed to English.";
    
    // Force speak regardless of volume settings
    speak(speakFeedback, true);
  };

  const handleMicClick = () => {
    listen((command, understood) => {
      console.log(`Voice Command: "${command}" | Understood: ${understood}`);
    });
  };

  const handleSpeechFeedback = () => {
    // Speaks instructions depending on the active page
    let instructionText = '';
    const path = location.pathname;

    if (settings.language === 'en') {
      if (path === '/') {
        const stats = getTodayStats();
        instructionText = `You are on the Home Dashboard. You completed ${stats.completed} of ${stats.total} reminders today. Tap the giant Red button for Emergency support.`;
      } else if (path === '/reminders') {
        instructionText = "You are on the Reminders page. Here you can see your daily tasks. Tap a circle to check them off, or press the Add New Task button to write a new one.";
      } else if (path === '/family') {
        instructionText = "You are on the Family memories page. Tap on any photo card to remember their relationship and story, or call them to speak.";
      } else if (path === '/brain') {
        instructionText = "You are on the Brain Gym. Play any of the three games above to exercise your mind.";
      } else if (path === '/emergency') {
        instructionText = "This is the Emergency help center. Pressing the large Red pulsing button will notify your caregivers immediately.";
      } else if (path === '/profile') {
        instructionText = "This is the settings page. You can adjust your name, font size, language, and speech volumes here.";
      } else if (path === '/caregiver') {
        instructionText = "This is the Caregiver access dashboard. You need to verify your PIN to view patient statistics and edit details.";
      }
    } else {
      // Kannada voice instructions
      if (path === '/') {
        const stats = getTodayStats();
        instructionText = `ನೀವು ಮುಖಪುಟ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿದ್ದೀರಿ. ಇಂದು ನೀವು ${stats.total} ರಲ್ಲಿ ${stats.completed} ಕೆಲಸಗಳನ್ನು ಮುಗಿಸಿದ್ದೀರಿ. ತುರ್ತು ನೆರವಿಗಾಗಿ ಕೆಂಪು ಬಟನ್ ಒತ್ತಿ.`;
      } else if (path === '/reminders') {
        instructionText = "ನೀವು ಜ್ಞಾಪನೆ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ದೈನಂದಿನ ಕೆಲಸಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು. ಮುಗಿದ ಕೆಲಸಗಳನ್ನು ಗುರುತಿಸಲು ವೃತ್ತದ ಮೇಲೆ ಒತ್ತಿ.";
      } else if (path === '/family') {
        instructionText = "ನೀವು ಕುಟುಂಬದ ನೆನಪುಗಳ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಅವರ ಬಗ್ಗೆ ತಿಳಿಯಲು ಮತ್ತು ಕರೆ ಮಾಡಲು ಫೋಟೋ ಮೇಲೆ ಒತ್ತಿ.";
      } else if (path === '/brain') {
        instructionText = "ನೀವು ಮೆದುಳಿನ ವ್ಯಾಯಾಮದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಚುರುಕಾಗಿಸಲು ಮೂರು ಆಟಗಳನ್ನು ಆಡಿ.";
      } else if (path === '/emergency') {
        instructionText = "ಇದು ತುರ್ತು ಸಹಾಯದ ಪುಟ. ಪಾಲಕರಿಗೆ ತಿಳಿಸಲು ಕೆಂಪು ಬಟನ್ ಒತ್ತಿ.";
      } else if (path === '/profile') {
        instructionText = "ಇದು ಸೆಟ್ಟಿಂಗ್ಸ್ ಪುಟ. ನಿಮ್ಮ ಹೆಸರು, ಅಕ್ಷರಗಳ ಗಾತ್ರ ಮತ್ತು ಭಾಷೆಯನ್ನು ಇಲ್ಲಿ ಬದಲಾಯಿಸಬಹುದು.";
      } else if (path === '/caregiver') {
        instructionText = "ಇದು ಪಾಲಕರ ಲಾಗಿನ್ ಪುಟ. ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ನಿಮ್ಮ ೪ ಅಂಕಿಯ ಪಿನ್ ನಮೂದಿಸಿ.";
      }
    }

    speak(instructionText, true);
  };

  const handleSosTrigger = () => {
    setShowSosConfirm(false);
    speak(settings.language === 'kn' ? "ತುರ್ತು ನೆರವು ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಸಹಾಯ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ." : "Emergency SOS activated. Caregivers are being notified.", true);
    navigate('/emergency');
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between"
      style={{ backgroundColor: '#F8F5EE', color: '#4A2E1F' }}
      data-font-size={settings.fontSize}
    >
      {/* Top Application Header */}
      <header className="bg-white border-b border-[#4A2E1F]/15 px-6 py-4 sticky top-0 z-40 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Logo & Clock Info */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center">
            <img src={logoImg} alt="MemoryMate Logo" className="h-16 w-auto object-contain" />
          </div>
          
          <div className="border-l-2 border-[#4A2E1F]/15 pl-4 text-right">
            <div className="font-mono text-2xl font-black text-[#4A2E1F]">{timeStr}</div>
            <div className="text-xs text-[#4A2E1F]/70 font-extrabold uppercase tracking-wider">{dayStr}, {dateStr}</div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Status Bar */}
          <div className="hidden lg:flex items-center gap-2 text-[#4A2E1F]/80 font-bold text-base bg-[#F8F5EE] px-4 py-2.5 rounded-2xl border border-[#4A2E1F]/10">
            <Wifi size={18} className="text-[#4A2E1F]" />
            <span>{settings.language === 'kn' ? 'ಸಂಪರ್ಕದಲ್ಲಿದೆ' : 'Connected'}</span>
            <span className="text-[#4A2E1F]/20 font-light">|</span>
            <Battery size={18} className="text-[#4A2E1F]" />
            <span>87%</span>
          </div>

          <div className="flex items-center gap-2.5 flex-grow md:flex-grow-0 justify-end">
            {/* Lang Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="h-14 px-5 bg-[#F8F5EE] hover:bg-[#4A2E1F]/5 text-[#4A2E1F] border-2 border-[#4A2E1F]/15 rounded-2xl font-black text-lg flex items-center gap-2 transition-all active-press"
              title="Change Language / ಭಾಷೆ ಬದಲಿಸಿ"
            >
              <Globe size={22} />
              <span>{settings.language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Read Aloud Assistance */}
            <button
              onClick={handleSpeechFeedback}
              className="w-14 h-14 bg-[#F8F5EE] hover:bg-[#4A2E1F]/5 text-[#4A2E1F] border-2 border-[#4A2E1F]/15 rounded-2xl flex items-center justify-center transition-all active-press"
              title="Explain This Page / ವಿವರಣೆ ಕೇಳಿ"
            >
              <Volume2 size={24} />
            </button>

            {/* Voice Mic Controller */}
            <button
              onClick={handleMicClick}
              className={`h-14 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all active-press ${
                isListening
                  ? 'bg-[#D32F2F] text-white animate-bounce shadow-md border border-red-600'
                  : 'bg-[#4A2E1F] hover:bg-[#4A2E1F]/90 text-white shadow-soft'
              }`}
              title="Voice Assistant / ಧ್ವನಿ ಆಜ್ಞೆಗಳು"
            >
              <Mic size={22} className={isListening ? 'animate-pulse' : ''} />
              <span className="font-extrabold text-base hidden sm:inline">
                {isListening ? (settings.language === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ...' : 'Listening...') : (settings.language === 'kn' ? 'ಮಾತನಾಡಿ' : 'Tap & Speak')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/family" element={<Family />} />
          <Route path="/brain" element={<BrainGym />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/caregiver" element={<Caregiver />} />
        </Routes>
      </main>

      {/* Accessibility Voice Listening Indicator Overlay */}
      {isListening && (
        <div className="fixed inset-x-0 bottom-28 md:bottom-28 mx-auto max-w-md bg-slate-900/95 backdrop-blur-md text-white p-6 rounded-3xl shadow-2xl border border-slate-800 z-50 flex items-center gap-4 animate-scale-up">
          <div className="p-4 bg-[#D32F2F] rounded-2xl animate-ping flex-shrink-0">
            <Mic size={28} />
          </div>
          <div>
            <h4 className="font-black text-[#D32F2F] text-lg">{t.dashboard.voiceListening}</h4>
            <p className="text-slate-350 text-base mt-1 font-medium">
              {speechText ? `"${speechText}"` : (settings.language === 'kn' ? t.dashboard.voiceInstruction : t.dashboard.voiceInstruction)}
            </p>
          </div>
        </div>
      )}

      {/* Redesigned Simplified Navigation Footer Bar */}
      <nav className="bg-white border-t-2 border-[#4A2E1F]/15 px-4 py-3 sticky bottom-0 z-40 shadow-xl flex justify-around items-center h-20">
        
        {/* Tab 1: Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all h-16 w-20 sm:w-28 ${
            location.pathname === '/' 
              ? 'bg-[#4A2E1F]/10 text-[#4A2E1F]' 
              : 'text-[#4A2E1F]/70 hover:bg-[#4A2E1F]/5 hover:text-[#4A2E1F]'
          }`}
        >
          <Home size={28} />
          <span className="text-xs font-bold leading-tight select-none">
            {settings.language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}
          </span>
        </Link>

        {/* Tab 2: Reminders */}
        <Link
          to="/reminders"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all h-16 w-20 sm:w-28 relative ${
            location.pathname === '/reminders' 
              ? 'bg-[#4A2E1F]/10 text-[#4A2E1F]' 
              : 'text-[#4A2E1F]/70 hover:bg-[#4A2E1F]/5 hover:text-[#4A2E1F]'
          }`}
        >
          {reminders.filter(r => r.status !== 'completed').length > 0 && (
            <span className="absolute top-1 right-3 bg-[#4A2E1F] text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-black shadow-md border-2 border-white">
              {reminders.filter(r => r.status !== 'completed').length}
            </span>
          )}
          <Calendar size={28} />
          <span className="text-xs font-bold leading-tight select-none">
            {t.nav.reminders}
          </span>
        </Link>

        {/* Tab 3: Family Memory */}
        <Link
          to="/family"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all h-16 w-20 sm:w-28 ${
            location.pathname === '/family' 
              ? 'bg-[#4A2E1F]/10 text-[#4A2E1F]' 
              : 'text-[#4A2E1F]/70 hover:bg-[#4A2E1F]/5 hover:text-[#4A2E1F]'
          }`}
        >
          <Users size={28} />
          <span className="text-xs font-bold leading-tight select-none">
            {settings.language === 'kn' ? 'ಕುಟುಂಬ' : 'Family'}
          </span>
        </Link>

        {/* Tab 4: Emergency SOS (Highly Highlighted Red) */}
        <button
          onClick={() => setShowSosConfirm(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all h-16 w-20 sm:w-28 text-white ${
            location.pathname === '/emergency'
              ? 'bg-[#D32F2F] shadow-lg shadow-red-200'
              : 'bg-[#D32F2F] hover:bg-[#D32F2F]/90 shadow-md animate-pulse-slow'
          }`}
        >
          <AlertTriangle size={28} />
          <span className="text-xs font-black leading-tight select-none">
            {settings.language === 'kn' ? 'ತುರ್ತು ಸಹಾಯ' : 'Emergency'}
          </span>
        </button>

        {/* Tab 5: More Options (☰ More Drawer Trigger) */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all h-16 w-20 sm:w-28 ${
            showMoreMenu 
              ? 'bg-[#4A2E1F]/10 text-[#4A2E1F]' 
              : 'text-[#4A2E1F]/70 hover:bg-[#4A2E1F]/5 hover:text-[#4A2E1F]'
          }`}
          aria-label="Open secondary menu options"
        >
          <Menu size={28} />
          <span className="text-xs font-bold leading-tight select-none">
            {settings.language === 'kn' ? 'ಮತ್ತಷ್ಟು' : 'More'}
          </span>
        </button>
      </nav>

      {/* Redesigned Slide-Up ☰ More Menu Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-[#4A2E1F]/60 backdrop-blur-sm z-50 flex items-end justify-center p-0 transition-opacity">
          <div className="bg-[#F8F5EE] border-t-4 border-[#4A2E1F] rounded-t-[32px] w-full max-w-xl shadow-2xl p-6 flex flex-col gap-5 animate-scale-up z-55">
            {/* Drawer Header */}
            <div className="flex justify-between items-center pb-2 border-b border-[#4A2E1F]/10">
              <h3 className="text-2xl font-black text-[#4A2E1F]">
                {settings.language === 'kn' ? 'ಹೆಚ್ಚಿನ ಆಯ್ಕೆಗಳು' : 'More Options'}
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-3 bg-[#4A2E1F]/10 hover:bg-[#4A2E1F]/15 text-[#4A2E1F] rounded-full transition-colors active-press"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Menu Links list */}
            <div className="flex flex-col gap-3">
              {/* Brain Gym */}
              <Link
                to="/brain"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-4 p-5 bg-white hover:bg-[#4A2E1F]/5 border-2 border-[#4A2E1F]/10 rounded-2xl transition-all text-left shadow-sm active-press"
              >
                <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl">
                  <Brain size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#4A2E1F]">
                    {t.nav.brainActivity}
                  </h4>
                  <p className="text-sm text-[#4A2E1F]/70 font-medium">
                    {settings.language === 'kn' ? 'ಮೆದುಳಿನ ವ್ಯಾಯಾಮ ಮತ್ತು ಮೋಜಿನ ಆಟಗಳು' : 'Fun & relaxing mind exercises'}
                  </p>
                </div>
              </Link>

              {/* Profile settings */}
              <Link
                to="/profile"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-4 p-5 bg-white hover:bg-[#4A2E1F]/5 border-2 border-[#4A2E1F]/10 rounded-2xl transition-all text-left shadow-sm active-press"
              >
                <div className="p-3.5 bg-blue-50 text-blue-700 rounded-xl">
                  <Settings size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#4A2E1F]">
                    {t.nav.profile}
                  </h4>
                  <p className="text-sm text-[#4A2E1F]/70 font-medium">
                    {settings.language === 'kn' ? 'ಅಕ್ಷರಗಳ ಗಾತ್ರ ಮತ್ತು ಧ್ವನಿ ಬದಲಿಸಿ' : 'Adjust font sizes and voice volume'}
                  </p>
                </div>
              </Link>

              {/* Caregiver secure portal */}
              <Link
                to="/caregiver"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-4 p-5 bg-white hover:bg-[#4A2E1F]/5 border-2 border-[#4A2E1F]/10 rounded-2xl transition-all text-left shadow-sm active-press"
              >
                <div className="p-3.5 bg-purple-50 text-purple-700 rounded-xl">
                  <Lock size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#4A2E1F]">
                    {t.nav.caregiver}
                  </h4>
                  <p className="text-sm text-[#4A2E1F]/70 font-medium">
                    {settings.language === 'kn' ? 'ಪಾಲಕರ ಲಾಗಿನ್ ಮತ್ತು ದಿನಚರಿ ವಿವರ' : 'Secure caregiver administration panel'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Giant accessible close button */}
            <button
              onClick={() => setShowMoreMenu(false)}
              className="h-14 bg-[#4A2E1F] hover:bg-[#4A2E1F]/90 text-white font-extrabold rounded-2xl text-lg w-full mt-2 shadow-md active-press"
            >
              {settings.language === 'kn' ? 'ಮೆನು ಮುಚ್ಚಿ' : 'Close Menu'}
            </button>
          </div>
        </div>
      )}

      {/* Global persistent Floating Emergency SOS Help Button */}
      {location.pathname !== '/emergency' && (
        <div className="fixed bottom-24 right-6 z-40">
          <button
            onClick={() => setShowSosConfirm(true)}
            className="h-16 px-6 bg-[#D32F2F] hover:bg-[#D32F2F]/95 text-white font-black text-lg rounded-full flex items-center gap-2.5 shadow-2xl active-press animate-emergency-pulse"
            aria-label="Request emergency support"
          >
            <Phone size={24} className="animate-bounce" />
            <span>{settings.language === 'kn' ? 'ತುರ್ತು ಸಹಾಯ' : 'Emergency Help'}</span>
          </button>
        </div>
      )}

      {/* Large Highly Accessible Emergency Confirmation Modal */}
      {showSosConfirm && (
        <div className="fixed inset-0 bg-[#4A2E1F]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-lg shadow-2xl border-4 border-[#D32F2F] flex flex-col items-center text-center gap-6 relative animate-scale-up">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-[#D32F2F] border-2 border-red-200">
              <AlertTriangle size={48} />
            </div>

            <div>
              <h3 className="text-3xl font-black text-[#D32F2F]">
                {settings.language === 'kn' ? 'ನಿಮಗೆ ತುರ್ತು ಸಹಾಯ ಬೇಕೇ?' : 'Do You Need Help?'}
              </h3>
              <p className="text-[#4A2E1F] text-lg font-bold mt-3 leading-relaxed">
                {settings.language === 'kn' 
                  ? 'ಹೌದು ಒತ್ತಿದರೆ, ನಿಮ್ಮ ಮನೆಯ ವಿಳಾಸವನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಪಾಲಕರಿಗೆ ಸಂದೇಶ ಹೋಗುತ್ತದೆ.' 
                  : 'Pressing YES will notify Lakshmi and show your home address details.'}
              </p>
            </div>

            {/* Giant Touch Buttons */}
            <div className="flex flex-col gap-3 w-full mt-2">
              <button
                onClick={handleSosTrigger}
                className="h-16 bg-[#D32F2F] hover:bg-red-700 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-md active-press"
              >
                <Phone size={26} />
                <span>{settings.language === 'kn' ? 'ಹೌದು, ಸಹಾಯ ಬೇಕು' : 'YES, SEND HELP NOW'}</span>
              </button>

              <button
                onClick={() => setShowSosConfirm(false)}
                className="h-16 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-lg rounded-2xl flex items-center justify-center shadow-sm active-press border border-slate-200"
              >
                {settings.language === 'kn' ? 'ಅಲ್ಲ, ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ / ರದ್ದು' : 'No, I am okay / Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
