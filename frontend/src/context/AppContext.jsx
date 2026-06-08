import React, { createContext, useEffect, useMemo, useState } from 'react';
import daughterImg from '../assets/daughter.png';
import sonImg from '../assets/son.png';
import spouseImg from '../assets/spouse.png';
import doctorImg from '../assets/doctor.png';
import api, { API_URL } from '../utils/api';

export const AppContext = createContext();

const DEMO_USER = {
  name: 'Ramachandra Rao',
  email: 'patient@memorymate.local',
  password: 'memorymate123',
  role: 'patient',
  age: 74,
  language: 'en',
  fontSize: 'large',
  voiceVolume: 'normal',
  address: 'Bengaluru, Karnataka'
};

const PRIMARY_CONTACT = {
  name: 'Raghavendra',
  relation: 'Son / Caregiver',
  phone: '+918310705466'
};

const DEFAULT_SETTINGS = {
  patientName: 'Ramachandra Rao',
  age: 74,
  language: 'en',
  fontSize: 'large',
  voiceVolume: 'normal',
  address: 'Bengaluru, Karnataka',
  emergencyContacts: [
    PRIMARY_CONTACT
  ]
};

const DEFAULT_REMINDERS = [
  {
    id: 'seed-rem-1',
    title: 'Morning Pills & Heart Medicine',
    titleKn: 'Morning Pills & Heart Medicine',
    time: '08:30',
    category: 'medicine',
    repeat: true,
    status: 'upcoming'
  },
  {
    id: 'seed-rem-2',
    title: 'Healthy Breakfast (Idli / Roti)',
    titleKn: 'Healthy Breakfast (Idli / Roti)',
    time: '09:00',
    category: 'food',
    repeat: true,
    status: 'upcoming'
  },
  {
    id: 'seed-rem-3',
    title: 'Hydration - Drink 1 glass of water',
    titleKn: 'Hydration - Drink 1 glass of water',
    time: '11:30',
    category: 'water',
    repeat: true,
    status: 'upcoming'
  },
  {
    id: 'seed-rem-4',
    title: 'Doctor Visit - Regular Checkup',
    titleKn: 'Doctor Visit - Regular Checkup',
    time: '16:00',
    category: 'appointment',
    repeat: false,
    status: 'upcoming'
  },
  {
    id: 'seed-rem-5',
    title: 'Evening Walk in Park',
    titleKn: 'Evening Walk in Park',
    time: '17:30',
    category: 'exercise',
    repeat: true,
    status: 'upcoming'
  }
];

const DEFAULT_FAMILY = [
  {
    id: 'seed-fam-1',
    name: 'Raghavendra',
    nameKn: 'ರಾಘವೇಂದ್ರ',
    relation: 'Son / Caregiver',
    relationKn: 'Son / Caregiver',
    phone: '+918310705466',
    notes: 'Raghavendra is your son and primary caregiver. He loves playing chess with you and lives in Bengaluru.',
    notesKn: 'ರಾಘವೇಂದ್ರ ನಿಮ್ಮ ಮಗ ಮತ್ತು ಮುಖ್ಯ ಪಾಲಕರು. ಅವರು ನಿಮ್ಮೊಂದಿಗೆ ಚೆಸ್ ಆಡಲು ಇಷ್ಟಪಡುತ್ತಾರೆ ಮತ್ತು ಬೆಂಗಳೂರಿನಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದಾರೆ.',
    photo: sonImg,
    isLocal: false
  },
  {
    id: 'seed-fam-2',
    name: 'Deepa',
    nameKn: 'Deepa',
    relation: 'Daughter',
    relationKn: 'Daughter',
    phone: '+919123456789',
    notes: 'Deepa is your loving daughter.',
    notesKn: 'Deepa is your loving daughter.',
    photo: daughterImg,
    isLocal: false
  },
  {
    id: 'seed-fam-3',
    name: 'Savitha',
    nameKn: 'Savitha',
    relation: 'Wife',
    relationKn: 'Wife',
    phone: '+919012345678',
    notes: 'Savitha is your caring wife. You have been married for 48 years.',
    notesKn: 'Savitha is your caring wife. You have been married for 48 years.',
    photo: spouseImg,
    isLocal: false
  },
  {
    id: 'seed-fam-4',
    name: 'Dr. Anand',
    nameKn: 'Dr. Anand',
    relation: 'Family Doctor',
    relationKn: 'Family Doctor',
    phone: '+919988776655',
    notes: 'Dr. Anand is your cardiologist. He is friendly and always reminds you to smile.',
    notesKn: 'Dr. Anand is your cardiologist. He is friendly and always reminds you to smile.',
    photo: doctorImg,
    isLocal: false
  }
];

const DEFAULT_ACTIVITY_LOGS = [
  { date: 'May 24', completed: 6, missed: 1 },
  { date: 'May 23', completed: 5, missed: 2 },
  { date: 'May 22', completed: 7, missed: 0 },
  { date: 'May 21', completed: 4, missed: 3 },
  { date: 'May 20', completed: 6, missed: 1 }
];

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const getStoredJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
};

const getStoredArray = (key, fallback) => {
  const saved = getStoredJson(key, fallback);
  return Array.isArray(saved) ? saved : fallback;
};

const mapReminderFromApi = (reminder) => ({
  id: reminder._id,
  title: reminder.title,
  titleKn: reminder.titleKn || reminder.title,
  time: reminder.time,
  category: reminder.type,
  repeat: reminder.recurring,
  status: reminder.completed ? 'completed' : reminder.missed ? 'missed' : 'upcoming',
  date: reminder.date
});

const mapReminderToApi = (reminder) => ({
  title: reminder.title,
  type: reminder.category === 'other' ? 'exercise' : reminder.category,
  date: reminder.date || todayIsoDate(),
  time: reminder.time,
  recurring: Boolean(reminder.repeat),
  completed: reminder.status === 'completed',
  missed: reminder.status === 'missed'
});

const familyPhotoByName = (name = '', relation = '') => {
  const normalizedName = String(name || '').toLowerCase();
  const normalizedRelation = String(relation || '').toLowerCase();
  
  if (normalizedName.includes('raghavendra') || normalizedName.includes('vijay') || normalizedRelation.includes('son') || normalizedName.includes('caregiver') || normalizedRelation.includes('caregiver')) {
    return sonImg;
  }
  if (normalizedName.includes('deepa') || normalizedRelation.includes('daughter')) {
    return daughterImg;
  }
  if (normalizedName.includes('savitha') || normalizedRelation.includes('wife') || normalizedRelation.includes('spouse')) {
    return spouseImg;
  }
  if (normalizedName.includes('anand') || normalizedName.includes('doctor') || normalizedRelation.includes('doctor')) {
    return doctorImg;
  }
  return doctorImg;
};

const oldDemoPhoneMap = {
  '9876543210': PRIMARY_CONTACT.phone,
  '9123456789': '+919123456789',
  '9012345678': '+919012345678',
  '9988776655': '+919988776655',
  '+918618118952': PRIMARY_CONTACT.phone,
  '8618118952': PRIMARY_CONTACT.phone,
  '918618118952': PRIMARY_CONTACT.phone
};

const normalizePhone = (phone) => oldDemoPhoneMap[String(phone)] || phone;

const mapFamilyFromApi = (member) => ({
  id: member._id,
  name: member.name,
  nameKn: member.nameKn || member.name,
  relation: member.relation,
  relationKn: member.relationKn || member.relation,
  phone: normalizePhone(member.phone),
  notes: member.note || '',
  notesKn: member.note || '',
  photo: member.photoUrl || familyPhotoByName(member.name, member.relation),
  isLocal: true
});

const mapFamilyToApi = (member) => ({
  name: member.name,
  relation: member.relation,
  phone: normalizePhone(member.phone),
  note: member.notes || member.note || ''
});

const hasOldDemoContact = (contact) => Boolean(oldDemoPhoneMap[String(contact.phone)]);

const normalizeContacts = (contacts = []) => {
  if (!Array.isArray(contacts) || contacts.length === 0 || contacts.some(hasOldDemoContact)) {
    return [PRIMARY_CONTACT];
  }

  return contacts;
};

const normalizeFamilyMembers = (members = []) => members.map((member) => ({
  ...member,
  phone: normalizePhone(member.phone)
}));

const mapProfileToSettings = (profile) => ({
  patientName: profile.name || DEFAULT_SETTINGS.patientName,
  age: profile.age || DEFAULT_SETTINGS.age,
  language: profile.language || DEFAULT_SETTINGS.language,
  fontSize: profile.fontSize || DEFAULT_SETTINGS.fontSize,
  voiceVolume: profile.voiceVolume || DEFAULT_SETTINGS.voiceVolume,
  address: profile.address || DEFAULT_SETTINGS.address,
  emergencyContacts: normalizeContacts(profile.emergencyContacts)
});

const mapSettingsToProfile = (settings) => ({
  name: settings.patientName,
  age: settings.age,
  language: settings.language,
  fontSize: settings.fontSize,
  voiceVolume: settings.voiceVolume,
  address: settings.address,
  emergencyContacts: normalizeContacts(settings.emergencyContacts)
});

export const AppProvider = ({ children }) => {
  const [settings, setSettingsState] = useState(() => {
    const savedSettings = getStoredJson('mm_settings', DEFAULT_SETTINGS);
    return { ...savedSettings, emergencyContacts: normalizeContacts(savedSettings.emergencyContacts) };
  });
  const [reminders, setReminders] = useState(() => getStoredArray('mm_reminders', DEFAULT_REMINDERS));
  const [family, setFamily] = useState(() => normalizeFamilyMembers(getStoredArray('mm_family', DEFAULT_FAMILY)));
  const [doctorNotes, setDoctorNotesState] = useState(() => localStorage.getItem('mm_doctor_notes') || 'Patient needs to be reminded to take heart medicines after breakfast. Check blood pressure twice a week.');
  const [activityLogs, setActivityLogs] = useState(() => getStoredArray('mm_activity_logs', DEFAULT_ACTIVITY_LOGS));
  const [apiStatus, setApiStatus] = useState({ connected: false, loading: true, error: null, url: API_URL });

  const ensureDemoAuth = async () => {
    const existingToken = localStorage.getItem('mm_auth_token');
    if (existingToken) return existingToken;

    try {
      const signup = await api.post('/auth/signup', DEMO_USER);
      localStorage.setItem('mm_auth_token', signup.data.token);
      localStorage.setItem('mm_auth_user', JSON.stringify(signup.data.user));
      return signup.data.token;
    } catch (signupError) {
      const login = await api.post('/auth/login', {
        email: DEMO_USER.email,
        password: DEMO_USER.password
      });
      localStorage.setItem('mm_auth_token', login.data.token);
      localStorage.setItem('mm_auth_user', JSON.stringify(login.data.user));
      return login.data.token;
    }
  };

  const loadFromApi = async () => {
    try {
      await ensureDemoAuth();

      const [profileRes, remindersRes, familyRes, analyticsRes] = await Promise.all([
        api.get('/patient/profile'),
        api.get('/reminders'),
        api.get('/family'),
        api.get('/analytics')
      ]);

      const nextSettings = mapProfileToSettings(profileRes.data.profile);
      setSettingsState(nextSettings);
      if (JSON.stringify(nextSettings.emergencyContacts) !== JSON.stringify(profileRes.data.profile.emergencyContacts || [])) {
        api.put('/patient/profile', mapSettingsToProfile(nextSettings)).catch(() => {});
      }
      setDoctorNotesState(profileRes.data.profile.medicalNotes || doctorNotes);

      let nextReminders = remindersRes.data.reminders.map(mapReminderFromApi);
      if (nextReminders.length === 0) {
        const created = await Promise.all(DEFAULT_REMINDERS.map((reminder) => api.post('/reminders', mapReminderToApi(reminder))));
        nextReminders = created.map((response) => mapReminderFromApi(response.data.reminder));
      }
      
      // Self-healing data deduplication for reminders
      const uniqueRemindersMap = {};
      const uniqueReminders = [];
      nextReminders.forEach(reminder => {
        const key = `${reminder.title.toLowerCase()}_${reminder.time}`;
        if (!uniqueRemindersMap[key]) {
          uniqueRemindersMap[key] = true;
          uniqueReminders.push(reminder);
        } else {
          // If a duplicate is found and has a database ID, clean it up in MongoDB
          if (reminder.id && !reminder.id.startsWith('local-') && !reminder.id.startsWith('seed-')) {
            api.delete(`/reminders/${reminder.id}`).catch(() => {});
          }
        }
      });
      setReminders(uniqueReminders);

      let nextFamily = familyRes.data.family.map(mapFamilyFromApi);
      if (nextFamily.length === 0) {
        const created = await Promise.all(DEFAULT_FAMILY.map((member) => api.post('/family', mapFamilyToApi(member))));
        nextFamily = created.map((response) => mapFamilyFromApi(response.data.family));
      } else {
        // Dynamic self-healing database migration for already-seeded records
        nextFamily = nextFamily.map(member => {
          const name = String(member.name || '').toLowerCase();
          const relation = String(member.relation || '').toLowerCase();
          
          if (name.includes('caregiver') || relation.includes('caregiver')) {
            const updated = {
              ...member,
              name: 'Raghavendra',
              nameKn: 'ರಾಘವೇಂದ್ರ',
              relation: 'Son / Caregiver',
              relationKn: 'Son / Caregiver',
              phone: '+918310705466',
              notes: 'Raghavendra is your son and primary caregiver. He loves playing chess with you and lives in Bengaluru.',
              notesKn: 'ರಾಘವೇಂದ್ರ ನಿಮ್ಮ ಮಗ ಮತ್ತು ಮುಖ್ಯ ಪಾಲಕರು. ಅವರು ನಿಮ್ಮೊಂದಿಗೆ ಚೆಸ್ ಆಡಲು ಇಷ್ಟಪಡುತ್ತಾರೆ ಮತ್ತು ಬೆಂಗಳೂರಿನಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದಾರೆ.',
              photo: sonImg
            };
            if (member.id && !member.id.startsWith('local-') && !member.id.startsWith('seed-')) {
              api.put(`/family/${member.id}`, mapFamilyToApi(updated)).catch(() => {});
            }
            return updated;
          }
          if (name.includes('vijay') || name.includes('raghavendra') || relation.includes('son') || name.includes('deepa') || relation.includes('daughter')) {
            if (name.includes('vijay') || name.includes('raghavendra') || relation.includes('son')) {
              const updated = {
                ...member,
                name: 'Deepa',
                nameKn: 'Deepa',
                relation: 'Daughter',
                relationKn: 'Daughter',
                phone: '+919123456789',
                notes: 'Deepa is your loving daughter.',
                notesKn: 'Deepa is your loving daughter.',
                photo: daughterImg
              };
              if (member.id && !member.id.startsWith('local-') && !member.id.startsWith('seed-')) {
                api.put(`/family/${member.id}`, mapFamilyToApi(updated)).catch(() => {});
              }
              return updated;
            }
          }
          return member;
        });
      }
      
      // Self-healing data deduplication for family members
      const uniqueFamilyMap = {};
      const uniqueFamily = [];
      nextFamily.forEach(member => {
        const key = `${member.name.toLowerCase()}_${member.relation.toLowerCase()}`;
        if (!uniqueFamilyMap[key]) {
          uniqueFamilyMap[key] = true;
          uniqueFamily.push(member);
        } else {
          // If a duplicate is found and has a database ID, clean it up in MongoDB
          if (member.id && !member.id.startsWith('local-') && !member.id.startsWith('seed-')) {
            api.delete(`/family/${member.id}`).catch(() => {});
          }
        }
      });
      setFamily(uniqueFamily);

      const weekly = analyticsRes.data.weeklyReport;
      if (weekly) {
        setActivityLogs([
          {
            date: 'This week',
            completed: weekly.completedReminders,
            missed: weekly.missedReminders
          }
        ]);
      }

      setApiStatus({ connected: true, loading: false, error: null, url: API_URL });
    } catch (error) {
      setApiStatus({
        connected: false,
        loading: false,
        error: error.response?.data?.message || error.message,
        url: API_URL
      });
    }
  };

  useEffect(() => {
    loadFromApi();
  }, []);

  useEffect(() => {
    localStorage.setItem('mm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mm_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('mm_family', JSON.stringify(family));
  }, [family]);

  useEffect(() => {
    localStorage.setItem('mm_doctor_notes', doctorNotes);
  }, [doctorNotes]);

  useEffect(() => {
    localStorage.setItem('mm_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const setSettings = (nextValue) => {
    setSettingsState((previous) => {
      const next = typeof nextValue === 'function' ? nextValue(previous) : nextValue;

      if (localStorage.getItem('mm_auth_token')) {
        api.put('/patient/profile', mapSettingsToProfile(next)).catch((error) => {
          setApiStatus((current) => ({
            ...current,
            connected: false,
            error: error.response?.data?.message || error.message
          }));
        });
      }

      return next;
    });
  };

  const addReminder = async (reminder) => {
    const optimistic = {
      id: `local-rem-${Date.now()}`,
      status: 'upcoming',
      ...reminder
    };
    setReminders((prev) => [...prev, optimistic].sort((a, b) => a.time.localeCompare(b.time)));

    try {
      const response = await api.post('/reminders', mapReminderToApi(optimistic));
      const saved = mapReminderFromApi(response.data.reminder);
      setReminders((prev) => prev.map((item) => (item.id === optimistic.id ? saved : item)));
    } catch (error) {
      setApiStatus((current) => ({ ...current, connected: false, error: error.response?.data?.message || error.message }));
    }
  };

  const deleteReminder = async (id) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));

    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      try {
        await api.delete(`/reminders/${id}`);
      } catch (error) {
        setApiStatus((current) => ({ ...current, connected: false, error: error.response?.data?.message || error.message }));
      }
    }
  };

  const toggleReminderStatus = async (id, newStatus) => {
    setReminders((prev) => prev.map((reminder) => (
      reminder.id === id ? { ...reminder, status: newStatus } : reminder
    )));

    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      try {
        await api.put(`/reminders/${id}`, {
          completed: newStatus === 'completed',
          missed: newStatus === 'missed'
        });
      } catch (error) {
        setApiStatus((current) => ({ ...current, connected: false, error: error.response?.data?.message || error.message }));
      }
    }
  };

  const addFamilyMember = async (member) => {
    const optimistic = {
      id: `local-fam-${Date.now()}`,
      isLocal: true,
      ...member,
      photo: member.photo || doctorImg
    };
    setFamily((prev) => [...prev, optimistic]);

    try {
      const response = await api.post('/family', mapFamilyToApi(optimistic));
      const saved = mapFamilyFromApi(response.data.family);
      setFamily((prev) => prev.map((item) => (item.id === optimistic.id ? saved : item)));
    } catch (error) {
      setApiStatus((current) => ({ ...current, connected: false, error: error.response?.data?.message || error.message }));
    }
  };

  const deleteFamilyMember = async (id) => {
    setFamily((prev) => prev.filter((member) => member.id !== id));

    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      try {
        await api.delete(`/family/${id}`);
      } catch (error) {
        setApiStatus((current) => ({ ...current, connected: false, error: error.response?.data?.message || error.message }));
      }
    }
  };

  const setDoctorNotes = (nextNotes) => {
    setDoctorNotesState(nextNotes);

    if (localStorage.getItem('mm_auth_token')) {
      api.put('/patient/profile', { medicalNotes: nextNotes }).catch((error) => {
        setApiStatus((current) => ({ ...current, connected: false, error: error.response?.data?.message || error.message }));
      });
    }
  };

  const getTodayStats = () => {
    const total = reminders.length;
    const completed = reminders.filter((reminder) => reminder.status === 'completed').length;
    const missed = reminders.filter((reminder) => reminder.status === 'missed').length;
    const upcoming = reminders.filter((reminder) => reminder.status === 'upcoming').length;
    return { total, completed, missed, upcoming };
  };

  const value = useMemo(() => ({
    settings,
    setSettings,
    reminders,
    addReminder,
    deleteReminder,
    toggleReminderStatus,
    family,
    addFamilyMember,
    deleteFamilyMember,
    doctorNotes,
    setDoctorNotes,
    activityLogs,
    setActivityLogs,
    getTodayStats,
    apiStatus,
    refreshFromApi: loadFromApi
  }), [settings, reminders, family, doctorNotes, activityLogs, apiStatus]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
