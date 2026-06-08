import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { CheckCircle2, Circle, Plus, Trash2, X, Bell, Clock, Calendar } from 'lucide-react';

const Reminders = () => {
  const { settings, reminders, addReminder, deleteReminder, toggleReminderStatus, getTodayStats } = useContext(AppContext);
  const { speak } = useVoice();
  const t = translations[settings.language] || translations.en;

  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('medicine');
  const [taskTime, setTaskTime] = useState('08:00');
  const [repeatDaily, setRepeatDaily] = useState(true);

  const stats = getTodayStats();

  const handleSave = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addReminder({
      title: taskTitle.trim(),
      titleKn: taskTitle.trim(), // simple duplication
      time: taskTime,
      category: taskCategory,
      repeat: repeatDaily
    });

    // Speak success
    const speakText = settings.language === 'kn'
      ? `ಜ್ಞಾಪನೆ ಸೇರಿಸಲಾಗಿದೆ: ${taskTitle}`
      : `Added reminder: ${taskTitle}`;
    speak(speakText);

    // Reset form
    setTaskTitle('');
    setTaskCategory('medicine');
    setTaskTime('08:00');
    setRepeatDaily(true);
    setIsAdding(false);
  };

  const handleDelete = (id, title) => {
    deleteReminder(id);
    const deleteSpeak = settings.language === 'kn'
      ? `ತೆಗೆದುಹಾಕಲಾಗಿದೆ: ${title}`
      : `Deleted: ${title}`;
    speak(deleteSpeak);
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

  const categories = ['medicine', 'food', 'water', 'appointment', 'other'];

  const pendingReminders = reminders.filter(r => r.status !== 'completed');
  const completedReminders = reminders.filter(r => r.status === 'completed');

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24 relative">
      {/* Header Panel */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <span>⏰</span> {t.reminders.title}
          </h1>
          <p className="text-slate-500 text-base mt-1">
            {settings.language === 'kn'
              ? `ಇಂದಿನ ಕೆಲಸಗಳು: ${stats.completed} ಮುಗಿದಿವೆ, ${stats.upcoming} ಬಾಕಿ ಇವೆ.`
              : `Today's schedule: ${stats.completed} completed, ${stats.upcoming} upcoming.`}
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(true);
            speak(settings.language === 'kn' ? "ಹೊಸ ಕೆಲಸ ಬರೆಯಿರಿ" : "Type a new task");
          }}
          className="w-full md:w-auto bg-brand-sky-dark text-white font-extrabold text-lg px-6 py-4 rounded-2xl hover:bg-brand-sky-hover transition-colors shadow-soft hover:shadow-premium flex items-center justify-center gap-2"
        >
          <Plus size={22} />
          <span>{t.reminders.addBtn}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft">
        <h2 className="text-lg font-black text-slate-600 mb-3 uppercase tracking-wider">
          {t.reminders.progressTitle}
        </h2>
        <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden relative border border-slate-200">
          <div
            className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center font-bold text-sm text-slate-700">
            {stats.completed} / {stats.total} {settings.language === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-premium border border-slate-100 flex flex-col gap-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <span>➕</span> {t.reminders.addBtn}
              </h2>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Task Name */}
              <div>
                <label className="block text-slate-600 font-bold mb-2">
                  {settings.language === 'kn' ? 'ಕೆಲಸದ ಹೆಸರು' : 'Task Name'}
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={t.reminders.form.titlePlaceholder}
                  className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-brand-sky-dark focus:ring-4 focus:ring-sky-100 font-bold text-lg"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-600 font-bold mb-2">
                  {t.reminders.category}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = taskCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTaskCategory(cat)}
                        className={`p-3 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'border-brand-sky-dark bg-sky-50 text-brand-sky-dark ring-2 ring-brand-sky-dark/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{t.reminders.categories[cat]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-2">
                    {t.reminders.time}
                  </label>
                  <input
                    type="time"
                    required
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-brand-sky-dark font-bold text-lg"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={repeatDaily}
                      onChange={(e) => setRepeatDaily(e.target.checked)}
                      className="w-6 h-6 text-brand-sky-dark focus:ring-sky-200 border-slate-350 rounded-lg"
                    />
                    <span className="font-bold text-slate-700 text-sm select-none">
                      {t.reminders.recurrence}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg rounded-2xl transition-colors"
                >
                  {t.reminders.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 p-4 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-bold text-lg rounded-2xl transition-colors shadow-soft"
                >
                  {t.reminders.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Reminders List */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-black text-slate-700 mb-4 flex items-center gap-2">
          <Bell className="text-sky-500" />
          <span>{t.reminders.pendingTasks} ({pendingReminders.length})</span>
        </h2>

        {pendingReminders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="font-bold">No pending tasks. You are all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingReminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-4 border-2 border-slate-150 rounded-2xl hover:border-brand-sky-dark transition-all duration-200 hover-speak bg-white"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      toggleReminderStatus(rem.id, 'completed');
                      const speakTitle = settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title;
                      speak(settings.language === 'kn' ? `ಪೂರ್ಣಗೊಂಡಿದೆ: ${speakTitle}` : `Completed: ${speakTitle}`);
                    }}
                    className="text-slate-400 hover:text-brand-sky-dark transition-colors"
                    aria-label="Mark task as complete"
                  >
                    <Circle size={32} className="text-slate-300" />
                  </button>
                  <div>
                    <h3 className="font-black text-lg text-slate-800">
                      {settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-500 bg-slate-100 rounded-lg px-2 py-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        {rem.time}
                      </span>
                      <span className={`text-xs font-semibold rounded-lg px-2 py-0.5 border ${getCategoryColor(rem.category)}`}>
                        {t.reminders.categories[rem.category]}
                      </span>
                      {rem.repeat && (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 rounded-lg px-2 py-0.5 border border-slate-100 flex items-center gap-1">
                          <Calendar size={12} />
                          {settings.language === 'kn' ? 'ಪ್ರತಿದಿನ' : 'Daily'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const itemTitle = settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title;
                      speak(settings.language === 'kn' ? `ಬಾಕಿ ಇದೆ: ${itemTitle} ಸಮಯ ${rem.time}` : `Pending: ${itemTitle} at ${rem.time}`);
                    }}
                    className="p-3 bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-brand-sky-dark rounded-xl transition-colors text-sm font-bold"
                  >
                    {settings.language === 'kn' ? 'ಕೇಳಿ' : 'Listen'}
                  </button>
                  <button
                    onClick={() => handleDelete(rem.id, settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title)}
                    className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Reminders List */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-black text-slate-700 mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-brand-mint-dark" />
          <span>{t.reminders.completedTasks} ({completedReminders.length})</span>
        </h2>

        {completedReminders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="font-bold">No tasks completed yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {completedReminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/75 opacity-75"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      toggleReminderStatus(rem.id, 'upcoming');
                      const speakTitle = settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title;
                      speak(settings.language === 'kn' ? `ಬಾಕಿ ಇದೆ: ${speakTitle}` : `Marked pending: ${speakTitle}`);
                    }}
                    className="text-brand-mint-dark hover:text-slate-400 transition-colors"
                    aria-label="Mark task as incomplete"
                  >
                    <CheckCircle2 size={32} className="text-brand-mint-dark" fill="#DCFCE7" />
                  </button>
                  <div>
                    <h3 className="font-black text-lg text-slate-500 line-through">
                      {settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-slate-400 bg-white rounded-lg px-2 py-0.5">
                        🕒 {rem.time}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 bg-white rounded-lg px-2 py-0.5 border border-slate-100">
                        {t.reminders.categories[rem.category]}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rem.id, settings.language === 'kn' ? (rem.titleKn || rem.title) : rem.title)}
                  className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                  aria-label="Delete completed reminder"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
