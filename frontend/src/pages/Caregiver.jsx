import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { Lock, Unlock, LogOut, FileText, Plus, Trash2, Check, BarChart2, Calendar, Users, Pill } from 'lucide-react';

const Caregiver = () => {
  const { 
    settings, 
    reminders, 
    deleteReminder, 
    family, 
    addFamilyMember, 
    deleteFamilyMember,
    doctorNotes, 
    setDoctorNotes, 
    activityLogs 
  } = useContext(AppContext);
  const { speak } = useVoice();
  const t = translations[settings.language] || translations.en;

  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Form states for family member creation
  const [famName, setFamName] = useState('');
  const [famNameKn, setFamNameKn] = useState('');
  const [famRelation, setFamRelation] = useState('');
  const [famRelationKn, setFamRelationKn] = useState('');
  const [famPhone, setFamPhone] = useState('');
  const [famNotes, setFamNotes] = useState('');
  const [famNotesKn, setFamNotesKn] = useState('');
  const [famSuccess, setFamSuccess] = useState(false);

  // Form states for doctor notes
  const [localDoctorNotes, setLocalDoctorNotes] = useState(doctorNotes);
  const [notesSuccess, setNotesSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
      setPin('');
      speak(settings.language === 'kn' ? "ಪಾಲಕರ ಪೋರ್ಟಲ್ ತೆರೆಯಲಾಗಿದೆ" : "Caregiver portal unlocked");
    } else {
      setPinError(true);
      setPin('');
      speak(t.caregiver.loginError);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    speak(settings.language === 'kn' ? "ಪೋರ್ಟಲ್ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ" : "Portal locked");
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    setDoctorNotes(localDoctorNotes);
    setNotesSuccess(true);
    speak(settings.language === 'kn' ? "ಟಿಪ್ಪಣಿ ಉಳಿಸಲಾಗಿದೆ" : "Doctor notes saved");
    setTimeout(() => setNotesSuccess(false), 3000);
  };

  const handleAddFamilyMember = (e) => {
    e.preventDefault();
    if (!famName || !famRelation || !famPhone || !famNotes) return;

    // Use doctor SVG as default for new members if they don't upload a custom one
    addFamilyMember({
      name: famName,
      nameKn: famNameKn || famName,
      relation: famRelation,
      relationKn: famRelationKn || famRelation,
      phone: famPhone,
      notes: famNotes,
      notesKn: famNotesKn || famNotes,
      photo: null // custom SVG initial trigger
    });

    setFamSuccess(true);
    speak(settings.language === 'kn' ? "ಕುಟುಂಬದ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಲಾಗಿದೆ" : "Family member added successfully");

    // Reset Form
    setFamName('');
    setFamNameKn('');
    setFamRelation('');
    setFamRelationKn('');
    setFamPhone('');
    setFamNotes('');
    setFamNotesKn('');

    setTimeout(() => setFamSuccess(false), 3000);
  };

  const handleDeleteMember = (id, name) => {
    deleteFamilyMember(id);
    speak(settings.language === 'kn' ? `${name} ತೆಗೆದುಹಾಕಲಾಗಿದೆ` : `Removed ${name}`);
  };

  const handleDeleteReminder = (id, title) => {
    deleteReminder(id);
    speak(settings.language === 'kn' ? `${title} ಜ್ಞಾಪನೆ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ` : `Deleted reminder: ${title}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white border-2 border-slate-150 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-premium text-center flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-brand-sky-dark flex items-center justify-center mx-auto border border-sky-100">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">{t.caregiver.loginTitle}</h1>
            <p className="text-slate-500 text-base mt-2">{t.caregiver.loginSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                maxLength="4"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.caregiver.pinPlaceholder}
                className="w-full text-center p-4 border-2 border-slate-200 rounded-2xl font-mono text-3xl tracking-widest bg-slate-50 focus:bg-white focus:border-brand-sky-dark focus:ring-4 focus:ring-sky-100"
              />
              {pinError && (
                <p className="text-red-500 text-sm font-bold mt-2">{t.caregiver.loginError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-4 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-black text-lg rounded-2xl shadow-soft transition-all active:scale-98"
            >
              {t.caregiver.loginBtn}
            </button>
          </form>
          
          <div className="text-xs text-slate-400 font-bold bg-slate-50 py-2 rounded-xl border border-slate-100">
            💡 Default Security Code: <span className="font-mono text-slate-655 text-sm">1234</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24">
      {/* Header Area */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-brand-mint-dark rounded-2xl">
            <Unlock size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">{t.caregiver.welcome}</h1>
            <p className="text-slate-500 text-base">
              Logged in as Administrator for {settings.patientName}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full md:w-auto p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
        >
          <LogOut size={18} />
          <span>{t.caregiver.logoutBtn}</span>
        </button>
      </div>

      {/* Grid: Analytics & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Completion Analytics */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft flex flex-col gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart2 className="text-emerald-500" />
            <span>{t.caregiver.missedAnalytics}</span>
          </h2>
          
          <div className="flex flex-col gap-3">
            {activityLogs.map((log, idx) => {
              const total = log.completed + log.missed;
              const pct = total > 0 ? Math.round((log.completed / total) * 100) : 0;
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-bold text-sm text-slate-600">
                    <span>{log.date}</span>
                    <span>{log.completed} done, {log.missed} missed ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-brand-mint-dark h-full" 
                      style={{ width: `${pct}%` }}
                    ></div>
                    <div 
                      className="bg-red-400 h-full" 
                      style={{ width: `${100 - pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor & Caregiver Medical Notes */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft flex flex-col gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="text-brand-sky-dark" />
            <span>{t.caregiver.doctorNotes}</span>
          </h2>
          
          <form onSubmit={handleSaveNotes} className="flex flex-col gap-4 flex-1 justify-between">
            <textarea
              required
              rows="6"
              value={localDoctorNotes}
              onChange={(e) => setLocalDoctorNotes(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:bg-white focus:border-brand-sky-dark text-slate-700 text-lg"
              placeholder="e.g. Heart meds post breakfast, blood pressure logs twice a week..."
            ></textarea>
            <button
              type="submit"
              className="p-4 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-bold rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {notesSuccess ? (
                <>
                  <Check size={18} />
                  <span>Notes Updated!</span>
                </>
              ) : (
                <span>{t.caregiver.saveNotes}</span>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Reminder Management Panel */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Calendar className="text-purple-500" />
          <span>{t.caregiver.reminderManagement}</span>
        </h2>
        
        {reminders.length === 0 ? (
          <p className="text-slate-400 py-4 font-bold text-center">No active reminders</p>
        ) : (
          <div className="flex flex-col gap-2">
            {reminders.map((rem) => (
              <div 
                key={rem.id}
                className="flex items-center justify-between p-3 border border-slate-150 rounded-2xl bg-slate-50 hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🕒</span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {rem.title} <span className="text-slate-400 font-normal">({rem.time})</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Category: {rem.category} | Repeat: {rem.repeat ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReminder(rem.id, rem.title)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-655 rounded-xl transition-all"
                  aria-label="Delete patient reminder"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family Directory Administration */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Users className="text-indigo-500" />
          <span>{t.caregiver.addFamilyMember}</span>
        </h2>

        {/* Family list details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {family.map((member) => (
            <div 
              key={member.id}
              className="flex items-center justify-between p-3 border border-slate-150 rounded-2xl bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-350 flex items-center justify-center text-slate-500 font-bold">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm">{member.name} ({member.relation})</h3>
                  <p className="text-xs text-slate-400 font-semibold">{member.phone}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteMember(member.id, member.name)}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-655 rounded-xl"
                aria-label="Delete family member"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new member form */}
        <form onSubmit={handleAddFamilyMember} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">{t.caregiver.patientName} (English)</label>
              <input
                type="text"
                required
                value={famName}
                onChange={(e) => setFamName(e.target.value)}
                placeholder="e.g. Deepa"
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base focus:border-brand-sky-dark"
              />
            </div>
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">{t.caregiver.patientName} (ಕನ್ನಡ)</label>
              <input
                type="text"
                value={famNameKn}
                onChange={(e) => setFamNameKn(e.target.value)}
                placeholder="ಉದಾ: ದೀಪಾ"
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base focus:border-brand-sky-dark"
              />
            </div>
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">Phone Number</label>
              <input
                type="tel"
                required
                value={famPhone}
                onChange={(e) => setFamPhone(e.target.value)}
                placeholder="e.g. +918310705466"
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base focus:border-brand-sky-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">Relationship (English)</label>
              <input
                type="text"
                required
                value={famRelation}
                onChange={(e) => setFamRelation(e.target.value)}
                placeholder="e.g. Daughter"
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base focus:border-brand-sky-dark"
              />
            </div>
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">Relationship (ಕನ್ನಡ)</label>
              <input
                type="text"
                value={famRelationKn}
                onChange={(e) => setFamRelationKn(e.target.value)}
                placeholder="ಉದಾ: ಮಗಳು"
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base focus:border-brand-sky-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">Memory Note Story (English)</label>
              <textarea
                required
                rows="3"
                value={famNotes}
                onChange={(e) => setFamNotes(e.target.value)}
                placeholder="e.g. She works as a software engineer and brings you apples every Sunday."
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base bg-slate-50 focus:bg-white focus:border-brand-sky-dark"
              ></textarea>
            </div>
            <div>
              <label className="block text-slate-655 font-bold mb-1 text-sm">Memory Note Story (ಕನ್ನಡ)</label>
              <textarea
                rows="3"
                value={famNotesKn}
                onChange={(e) => setFamNotesKn(e.target.value)}
                placeholder="ಉದಾ: ಇವರು ಸಾಫ್ಟ್‌ವೇರ್ ಎಂಜಿನಿಯರ್ ಮತ್ತು ಪ್ರತಿ ಭಾನುವಾರ ಸೇಬು ತರುತ್ತಾರೆ."
                className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold text-base bg-slate-50 focus:bg-white focus:border-brand-sky-dark"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="p-4 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-bold rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {famSuccess ? (
              <>
                <Check size={18} />
                <span>Family Member Enrolled!</span>
              </>
            ) : (
              <span>{t.caregiver.addBtn}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Caregiver;
