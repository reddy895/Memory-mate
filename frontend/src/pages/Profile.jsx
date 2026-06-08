import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { User, Phone, Check, Settings, Plus, Trash2 } from 'lucide-react';

const Profile = () => {
  const { settings, setSettings } = useContext(AppContext);
  const { speak } = useVoice();
  const t = translations[settings.language] || translations.en;

  const [patientName, setPatientName] = useState(settings.patientName);
  const [age, setAge] = useState(settings.age);
  const [language, setLanguage] = useState(settings.language);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [voiceVolume, setVoiceVolume] = useState(settings.voiceVolume);
  const [contacts, setContacts] = useState(settings.emergencyContacts || []);

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();

    setSettings({
      patientName,
      age: parseInt(age, 10),
      language,
      fontSize,
      voiceVolume,
      emergencyContacts: contacts
    });

    setSuccess(true);
    speak(t.profile.successMsg);

    // Apply font-size to HTML wrapper dynamic element immediately for preview
    document.documentElement.setAttribute('data-font-size', fontSize);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    setContacts(prev => [...prev, { name: newContactName.trim(), phone: newContactPhone.trim() }]);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleRemoveContact = (idx) => {
    setContacts(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24">
      {/* Header Info */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft flex items-center gap-4">
        <div className="p-4 bg-sky-50 text-brand-sky-dark rounded-2xl">
          <Settings size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">{t.profile.title}</h1>
          <p className="text-slate-500 text-base mt-1">
            {settings.language === 'kn' ? 'ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನಿಮ್ಮ ವಿವರಗಳು ಮತ್ತು ಅಗತ್ಯ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಬದಲಿಸಿ.' : 'Customize the text size, speak volume, and preferred language.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Main Settings Panel */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-soft flex flex-col gap-6">
          
          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-600 font-bold mb-2">{t.profile.nameLabel}</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-lg focus:border-brand-sky-dark"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-2">{t.profile.ageLabel}</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-lg focus:border-brand-sky-dark"
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div>
            <label className="block text-slate-600 font-bold mb-2">{t.profile.langLabel}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-4 border-2 rounded-2xl font-black text-xl transition-all ${
                  language === 'en'
                    ? 'border-brand-sky-dark bg-sky-50 text-brand-sky-dark ring-2 ring-brand-sky-dark/20'
                    : 'border-slate-250 hover:bg-slate-50 text-slate-500 bg-white'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`p-4 border-2 rounded-2xl font-black text-xl transition-all ${
                  language === 'kn'
                    ? 'border-brand-sky-dark bg-sky-50 text-brand-sky-dark ring-2 ring-brand-sky-dark/20'
                    : 'border-slate-250 hover:bg-slate-50 text-slate-500 bg-white'
                }`}
              >
                🇮🇳 ಕನ್ನಡ (Kannada)
              </button>
            </div>
          </div>

          {/* Font Sizes options */}
          <div>
            <label className="block text-slate-600 font-bold mb-2">{t.profile.fontSizeLabel}</label>
            <div className="grid grid-cols-3 gap-3">
              {['normal', 'large', 'xlarge'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`p-4 border-2 rounded-2xl font-bold text-base transition-all ${
                    fontSize === size
                      ? 'border-brand-sky-dark bg-sky-50 text-brand-sky-dark ring-2 ring-brand-sky-dark/20'
                      : 'border-slate-250 hover:bg-slate-50 text-slate-600 bg-white'
                  }`}
                >
                  <span className={size === 'normal' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-2xl font-black'}>
                    {t.profile.fontSizes[size]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TTS Guidance Volume toggles */}
          <div>
            <label className="block text-slate-600 font-bold mb-2">{t.profile.voiceLabel}</label>
            <div className="grid grid-cols-4 gap-2">
              {['muted', 'soft', 'normal', 'loud'].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setVoiceVolume(vol)}
                  className={`p-3 border-2 rounded-2xl font-bold text-base transition-all ${
                    voiceVolume === vol
                      ? 'border-brand-sky-dark bg-sky-50 text-brand-sky-dark ring-2 ring-brand-sky-dark/20'
                      : 'border-slate-250 hover:bg-slate-50 text-slate-600 bg-white'
                  }`}
                >
                  <span>{t.profile.voiceToggles[vol]}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Emergency Contacts Configuration Card */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-soft flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>🚨</span> {settings.language === 'kn' ? 'ತುರ್ತು ಸಂಪರ್ಕಗಳು' : 'SOS Contacts Management'}
            </h2>
            <button
              type="button"
              onClick={() => setShowAddContact(!showAddContact)}
              className="p-2 bg-sky-50 text-brand-sky-dark hover:bg-sky-100 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors"
            >
              <Plus size={16} />
              <span>{settings.language === 'kn' ? 'ಸೇರಿಸಿ' : 'Add Contact'}</span>
            </button>
          </div>

          {showAddContact && (
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-end animate-scale-up">
              <div className="flex-1 w-full">
                <label className="block text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">
                  Name / Relationship
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepa (Daughter)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold bg-white focus:border-brand-sky-dark"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +918310705466"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl font-bold bg-white focus:border-brand-sky-dark"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-655 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="flex-1 px-4 py-3 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-bold rounded-xl shadow-soft"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {contacts.map((contact, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800">{contact.name}</h3>
                    <p className="text-slate-455 text-sm font-semibold">📞 {contact.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(idx)}
                  className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-655 rounded-xl transition-all"
                  aria-label="Remove contact"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="w-full p-5 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-black text-xl rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {success ? (
              <>
                <Check size={24} />
                <span>{settings.language === 'kn' ? 'ಉಳಿಸಲಾಗಿದೆ!' : 'Saved successfully!'}</span>
              </>
            ) : (
              <span>{t.profile.saveBtn}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
