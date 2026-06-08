import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Phone, 
  Play, 
  ChevronRight, 
  Mic, 
  Volume2,
  Clock,
  MapPin,
  Heart,
  MessageSquare,
  Smile,
  Users,
  User,
  Pill
} from 'lucide-react';

// Import Caregiver & Family Portrait Assets
import daughterImg from '../assets/daughter.png';
import sonImg from '../assets/son.png';
import spouseImg from '../assets/spouse.svg';
import doctorImg from '../assets/doctor.svg';
import patientImg from '../assets/patient.png';

const Dashboard = () => {
  const { settings, reminders, toggleReminderStatus, getTodayStats, family } = useContext(AppContext);
  const { speak, listen, isListening, supported } = useVoice();
  const navigate = useNavigate();
  const t = translations[settings.language] || translations.en;

  // Determine greeting based on current time
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    // Realtime clock updates
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      
      if (hours >= 5 && hours < 12) {
        setGreeting(t.dashboard.greetingMorning);
      } else if (hours >= 12 && hours < 17) {
        setGreeting(t.dashboard.greetingAfternoon);
      } else if (hours >= 17 && hours < 21) {
        setGreeting(t.dashboard.greetingEvening);
      } else {
        setGreeting(t.dashboard.greetingNight);
      }

      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString(settings.language === 'kn' ? 'kn-IN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      setCurrentDay(now.toLocaleDateString(settings.language === 'kn' ? 'kn-IN' : 'en-US', { weekday: 'long' }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [settings.language, t]);

  const stats = getTodayStats();

  // Narrate page overview on load
  useEffect(() => {
    const total = stats.total;
    const completed = stats.completed;
    const voiceMsg = settings.language === 'kn' 
      ? `ಹಲೋ ${settings.patientName}, ಇಂದಿನ ದಿನಚರಿಯಲ್ಲಿ ನಿಮಗೆ ${total} ಕೆಲಸಗಳಿವೆ. ಇದರಲ್ಲಿ ${completed} ಪೂರ್ಣಗೊಂಡಿವೆ.`
      : `Hello ${settings.patientName}, you have ${total} reminders today. You have completed ${completed} of them.`;
    
    const voiceTimer = setTimeout(() => {
      speak(voiceMsg);
    }, 1000);

    return () => clearTimeout(voiceTimer);
  }, []);

  // Medication Helper: Retrieve the first upcoming or any medicine task
  const activeMedicine = reminders.find(r => r.category === 'medicine' && r.status === 'upcoming') || 
                         reminders.find(r => r.category === 'medicine') || 
                         { title: "Morning Pills & Heart Medicine", time: "08:30", id: "seed-rem-1" };

  const handleMedicationStatus = (id, status) => {
    toggleReminderStatus(id, status);
    if (status === 'completed') {
      const congratMsg = settings.language === 'kn'
        ? `ಉತ್ತಮ ಕೆಲಸ! ನೀವು ನಿಮ್ಮ ಮಾತ್ರೆಗಳನ್ನು ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ.`
        : `Wonderful job! You have taken your morning medicines.`;
      speak(congratMsg, true);
    } else {
      speak(settings.language === 'kn' ? `ಸರಿ, ನಾನು ೧೫ ನಿಮಿಷಗಳ ನಂತರ ನೆನಪಿಸುತ್ತೇನೆ.` : `Okay, I will remind you again shortly.`, true);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'medicine': return 'bg-red-50 border-red-200 text-red-700';
      case 'food': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'water': return 'bg-sky-50 border-sky-200 text-sky-700';
      case 'appointment': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  };

  const getCategoryIcon = (cat) => {
    return '';
  };

  const handleMicClick = () => {
    listen((command, understood) => {
      console.log(`Voice Command: "${command}" | Understood: ${understood}`);
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-28">
      
      {/* 1. Senior Accessible Hero Card */}
      <div className="bg-white border-4 border-[#4A2E1F]/15 rounded-[36px] p-6 md:p-8 shadow-premium flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Soft reassuring backdrop glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

        {/* Large Patient Profile Photo */}
        <div className="w-32 h-32 rounded-full border-4 border-[#4A2E1F]/20 overflow-hidden bg-[#F1ECE1] flex shrink-0 shadow-md">
          <img 
            src={patientImg} 
            alt={settings.patientName} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Hero Area Description Details */}
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-lg font-bold text-[#4A2E1F]/70 tracking-wide uppercase">
            {settings.language === 'kn' ? 'ನಿಮ್ಮ ದಿನಚರಿ' : 'Welcome Back'}
          </h2>
          <h1 className="text-3xl md:text-4xl font-black text-[#4A2E1F] mt-1 leading-tight">
            {greeting}, {settings.patientName}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
            {/* Reassuring clock info */}
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F8F5EE] border border-[#4A2E1F]/10 rounded-full font-bold text-base text-[#4A2E1F]">
              <Clock size={18} />
              <span>{currentDay}, {currentTime}</span>
            </span>

            {/* Reassurance Location Badge */}
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full font-black text-base text-[#2E7D32]">
              <MapPin size={18} />
              <span>{settings.language === 'kn' ? 'ಸ್ಥಳ: ಮನೆ (ಸುರಕ್ಷಿತ)' : 'Current Location: Home'}</span>
            </span>
          </div>

          {/* Simple Completed Reminders Checklist Progress */}
          <div className="mt-4 pt-3 border-t border-[#4A2E1F]/10 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-xl font-bold text-[#2E7D32]">
              <CheckCircle2 size={24} fill="#DCFCE7" />
              <span>
                {settings.language === 'kn' 
                  ? `ಇಂದು ನೀವು ${stats.total} ರಲ್ಲಿ ${stats.completed} ಜ್ಞಾಪನೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ.`
                  : `You completed ${stats.completed} of ${stats.total} reminders today.`}
              </span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-[#2E7D32] rounded-full text-sm font-black uppercase tracking-wider">
              ✓ Completed reminders today
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Medication Reassurance & Caregiver Touch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 2. Dedicated Accessible Medication Card */}
        <div className="bg-white border-4 border-[#2E7D32]/25 rounded-[32px] p-6 shadow-premium flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl"></div>
          
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-black uppercase tracking-wider">
              Current Medication Task
            </span>
            <h3 className="text-3xl font-black text-[#4A2E1F] mt-3 leading-snug">
              {settings.language === 'kn' ? (activeMedicine.titleKn || activeMedicine.title) : activeMedicine.title}
            </h3>
            
            <div className="flex items-center gap-2 text-xl font-extrabold text-[#4A2E1F]/70 mt-2">
              <Clock size={20} />
              <span>{settings.language === 'kn' ? 'ನಿಗದಿತ ಸಮಯ:' : 'Scheduled for:'} <strong className="text-[#4A2E1F] font-black">{activeMedicine.time}</strong></span>
            </div>
          </div>

          {/* Huge Touch Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              onClick={() => handleMedicationStatus(activeMedicine.id, activeMedicine.status === 'completed' ? 'upcoming' : 'completed')}
              className={`flex-1 h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-md transition-all active-press ${
                activeMedicine.status === 'completed'
                  ? 'bg-slate-100 text-slate-500 border-2 border-slate-200'
                  : 'bg-[#2E7D32] hover:bg-[#2E7D32]/95 text-white'
              }`}
            >
              <CheckCircle2 size={24} />
              <span>{activeMedicine.status === 'completed' ? (settings.language === 'kn' ? 'ತೆಗೆದುಕೊಂಡಿದೆ' : 'Taken ✓') : (settings.language === 'kn' ? 'ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ' : 'Taken')}</span>
            </button>

            <button
              onClick={() => handleMedicationStatus(activeMedicine.id, 'missed')}
              className="flex-1 h-16 bg-[#F9A825] hover:bg-[#F9A825]/95 text-[#4A2E1F] font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active-press"
            >
              <span>{settings.language === 'kn' ? 'ನಂತರ ನೆನಪಿಸು' : 'Remind Again'}</span>
            </button>
          </div>
        </div>

        {/* 3. Son/Primary Caregiver Contact Photo Card */}
        <div className="bg-white border-4 border-[#4A2E1F]/15 rounded-[32px] p-6 shadow-premium flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Son Portrait Image */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#4A2E1F]/10 bg-[#F1ECE1] flex-shrink-0 flex items-center justify-center shadow-inner">
              <img 
                src={sonImg} 
                alt="Raghavendra Son Caregiver" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="text-center sm:text-left">
              <span className="inline-block px-3 py-0.5 bg-[#4A2E1F]/10 text-[#4A2E1F] rounded-full text-xs font-black uppercase tracking-wider">
                {settings.language === 'kn' ? 'ಪಾಲಕರು' : 'Primary Caregiver'}
              </span>
              <h3 className="text-2xl font-black text-[#4A2E1F] mt-1.5">
                {settings.language === 'kn' ? 'ರಾಘವೇಂದ್ರ (ಮಗ)' : 'Raghavendra'}
              </h3>
              <p className="text-lg font-bold text-[#4A2E1F]/65">
                {settings.language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರೀತಿಯ ಮಗ' : 'Son'}
              </p>
            </div>
          </div>

          {/* Huge Touch friendly call/message actions */}
          <div className="flex gap-3 w-full">
            <a
              href={`tel:+918310705466`}
              onClick={() => speak(settings.language === 'kn' ? "ರಾಘವೇಂದ್ರ ಅವರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ" : "Calling your son Raghavendra", true)}
              className="flex-1 h-16 bg-[#2E7D32] hover:bg-[#2E7D32]/95 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active-press"
            >
              <Phone size={24} />
              <span>{settings.language === 'kn' ? 'ಕರೆ ಮಾಡಿ' : 'Call'}</span>
            </a>

            <a
              href="https://wa.me/918310705466?text=Hello%20Raghavendra,%20I%20am%20thinking%20of%20you."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => speak(settings.language === 'kn' ? "ರಾಘವೇಂದ್ರ ಅವರಿಗೆ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ" : "Opening WhatsApp to message Raghavendra", true)}
              className="flex-1 h-16 bg-[#4A2E1F] hover:bg-[#4A2E1F]/90 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active-press"
            >
              <MessageSquare size={24} />
              <span>{settings.language === 'kn' ? 'ಸಂದೇಶ' : 'Message'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Today's Schedule Timeline directly below Greeting */}
      <div className="bg-white border-4 border-[#4A2E1F]/15 rounded-[36px] p-6 md:p-8 shadow-premium">
        <div className="flex justify-between items-center mb-6 border-b border-[#4A2E1F]/10 pb-4">
          <div>
            <h2 className="text-3xl font-black text-[#4A2E1F] flex items-center gap-2">
              {t.dashboard.todayTimeline}
            </h2>
            <p className="text-sm font-bold text-[#4A2E1F]/65 mt-1">
              {settings.language === 'kn' ? 'ಇಂದಿನ ಕೆಲಸಗಳು ಮತ್ತು ಜ್ಞಾಪನೆಗಳು ಇಲ್ಲಿವೆ' : 'Your schedule for today. Keep checking items as you complete them.'}
            </p>
          </div>
          <Link
            to="/reminders"
            className="h-12 px-5 bg-[#F8F5EE] border-2 border-[#4A2E1F]/15 rounded-xl text-[#4A2E1F] font-black text-sm flex items-center gap-1 hover:bg-[#4A2E1F]/5 transition-all"
          >
            <span>{settings.language === 'kn' ? 'ಕೆಲಸ ನಿರ್ವಹಿಸಿ' : 'Manage Tasks'}</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-10 bg-[#F8F5EE] rounded-3xl border-2 border-dashed border-[#4A2E1F]/20 text-[#4A2E1F]/60">
            <p className="text-xl font-bold">No tasks set for today.</p>
            <Link to="/reminders" className="mt-2 text-[#4A2E1F] underline block font-extrabold text-base">
              Create a new reminder
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reminders.map((rem) => {
              const isCompleted = rem.status === 'completed';
              return (
                <div
                  key={rem.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-3 rounded-3xl transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-slate-50/70 border-slate-100 opacity-60' 
                      : 'bg-white border-[#4A2E1F]/15 shadow-sm hover:border-[#4A2E1F]'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    {/* Big checklist checkbox */}
                    <button
                      onClick={() => {
                        const newStatus = isCompleted ? 'upcoming' : 'completed';
                        toggleReminderStatus(rem.id, newStatus);
                        
                        // Speech feedback on check/uncheck
                        if (newStatus === 'completed') {
                          const completeText = settings.language === 'kn'
                            ? `ಅದ್ಭುತ ಕೆಲಸ! '${rem.titleKn || rem.title}' ಪೂರ್ಣಗೊಂಡಿದೆ.`
                            : `Great job! You completed '${rem.title}'.`;
                          speak(completeText, true);
                        }
                      }}
                      className="text-slate-450 hover:text-[#4A2E1F] transition-colors rounded-full focus:ring-4 focus:ring-[#4A2E1F]/20 shrink-0"
                      aria-label="Toggle task completed status"
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={48} className="text-[#2E7D32]" fill="#E8F5E9" />
                      ) : (
                        <Circle size={48} className="text-[#4A2E1F]/30" />
                      )}
                    </button>

                    {/* Task details */}
                    <div className="flex-grow">
                      <p className={`font-black text-xl md:text-2xl ${isCompleted ? 'line-through text-slate-450' : 'text-[#4A2E1F]'}`}>
                        {settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-base font-black text-[#4A2E1F] bg-[#F8F5EE] border border-[#4A2E1F]/10 rounded-lg px-2.5 py-0.5 flex items-center gap-1.5">
                          <Clock size={16} className="text-[#4A2E1F]/70" />
                          <span>{rem.time}</span>
                        </span>
                        <span className={`text-sm font-extrabold rounded-lg px-2.5 py-0.5 border ${getCategoryColor(rem.category)}`}>
                          {getCategoryIcon(rem.category)} {t.reminders.categories[rem.category]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Narration Assist Button per item */}
                  <div className="flex justify-end w-full sm:w-auto mt-3 sm:mt-0 gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const itemTitle = settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title;
                        const repeatMsg = settings.language === 'kn'
                          ? `ಸಮಯ ${rem.time} ಕ್ಕೆ ${itemTitle}`
                          : `At ${rem.time}, ${itemTitle}`;
                        speak(repeatMsg, true);
                      }}
                      className="h-12 px-4 bg-[#F8F5EE] hover:bg-[#4A2E1F]/5 text-[#4A2E1F] border border-[#4A2E1F]/15 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors active-press"
                      title="Read Task Aloud"
                    >
                      <Volume2 size={18} />
                      <span>{settings.language === 'kn' ? 'ಕೇಳಿ' : 'Listen'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Family Memory Support Card */}
      <div className="bg-white border-4 border-[#4A2E1F]/15 rounded-[36px] p-6 md:p-8 shadow-premium">
        <div className="flex justify-between items-center mb-6 border-b border-[#4A2E1F]/10 pb-4">
          <div>
            <h2 className="text-3xl font-black text-[#4A2E1F] flex items-center gap-2.5">
              <Users size={32} />
              <span>{settings.language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರೀತಿಯ ಕುಟುಂಬ' : 'Your Family & Memories'}</span>
            </h2>
            <p className="text-sm font-bold text-[#4A2E1F]/65 mt-1">
              {settings.language === 'kn' ? 'ಅವರ ನೆನಪುಗಳನ್ನು ನೋಡಲು ಮತ್ತು ಮಾತನಾಡಲು ಫೋಟೋ ಮೇಲೆ ಒತ್ತಿ' : 'Tap on any family portrait card below to remember their story and call them.'}
            </p>
          </div>
          <Link
            to="/family"
            className="h-12 px-5 bg-[#F8F5EE] border-2 border-[#4A2E1F]/15 rounded-xl text-[#4A2E1F] font-black text-sm flex items-center gap-1 hover:bg-[#4A2E1F]/5 transition-all"
          >
            <span>{settings.language === 'kn' ? 'ಎಲ್ಲಾ ಕುಟುಂಬ' : 'View All'}</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Dynamic Photo based family recognition deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {family.slice(0, 4).map((member) => (
            <button
              key={member.id}
              onClick={() => {
                navigate('/family', { state: { autoCallMemberId: member.id } });
                speak(settings.language === 'kn' ? `${member.nameKn || member.name} ಅವರ ನೆನಪುಗಳನ್ನು ತೆರೆಯುತ್ತಿರುವೆ` : `Opening memories of ${member.name}`, true);
              }}
              className="bg-white border-2 border-[#4A2E1F]/15 hover:border-[#4A2E1F] rounded-[28px] p-4 flex flex-col items-center gap-4 text-center shadow-soft transition-all active-press"
            >
              {/* Family Avatar Portrait */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#4A2E1F]/10 bg-[#F1ECE1] flex items-center justify-center shadow-md">
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full hidden bg-amber-100 text-amber-700 text-3xl font-black items-center justify-center">
                  {member.name.charAt(0)}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-black text-[#4A2E1F]">
                  {settings.language === 'kn' ? (member.nameKn || member.name) : member.name}
                </h4>
                <span className="inline-block mt-1 px-3 py-0.5 bg-[#4A2E1F]/10 text-[#4A2E1F] font-extrabold text-xs uppercase tracking-wider rounded-lg">
                  {settings.language === 'kn' ? (member.relationKn || member.relation) : member.relation}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Glowing Circular Voice Assistant Microphone Panel */}
      <div className="bg-[#4A2E1F] text-white rounded-[36px] p-8 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft reassuring backdrop glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>

        <div className="flex items-start gap-5 relative z-10">
          <div className="p-4 bg-white/10 border border-white/20 rounded-3xl text-amber-400 shrink-0 animate-pulse-slow">
            <Mic size={36} />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white mb-2">
              {settings.language === 'kn' ? 'ಮೆಮೊರಿಮೇಟ್ ಜೊತೆಗೆ ಮಾತನಾಡಿ' : 'Comforting Voice Assistant'}
            </h4>
            <p className="text-base text-white/80 max-w-md font-medium leading-relaxed">
              {settings.language === 'kn' 
                ? 'ಮಾತನಾಡುವ ಮೂಲಕ ಕೆಲಸಗಳನ್ನು ತಿಳಿಯಲು ಕೆಳಗಿನ ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಒತ್ತಿ.' 
                : 'Having trouble reading or remembering? Just tap the microphone and ask MemoryMate in natural speech.'}
            </p>
            
            {/* Spoken example options prompt list */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400 block mb-2">
                {settings.language === 'kn' ? 'ನೀವು ಈ ರೀತಿ ಹೇಳಬಹುದು:' : 'Try Saying:'}
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/90 font-bold">
                <li>"Call my daughter"</li>
                <li>"What medicine should I take?"</li>
                <li>"What's next today?"</li>
                <li>"Show family photos"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Touch button controller */}
        <button
          onClick={handleMicClick}
          className={`h-24 px-8 rounded-3xl flex flex-col items-center justify-center gap-1.5 shadow-2xl relative z-10 shrink-0 border-2 border-white/15 transition-all active-press ${
            isListening
              ? 'bg-[#D32F2F] text-white animate-bounce'
              : 'bg-white hover:bg-slate-50 text-[#4A2E1F]'
          }`}
        >
          <Mic size={36} className={isListening ? 'animate-pulse' : ''} />
          <span className="font-black text-base uppercase tracking-wider select-none">
            {isListening ? (settings.language === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ...' : 'Listening...') : (settings.language === 'kn' ? 'ಟ್ಯಾಪ್ ಮಾಡಿ' : 'Tap & Speak')}
          </span>
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
