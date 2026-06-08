import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { AlertCircle, AlertOctagon, Heart, Loader2, MapPin, Phone, RefreshCw, ShieldAlert, Send, X } from 'lucide-react';

const CAREGIVER_PHONE_DISPLAY = '+91 8310705466';
const CAREGIVER_PHONE_TEL = '+918310705466';
const CAREGIVER_WHATSAPP = '918310705466';

const locationErrorMessages = {
  1: 'Location permission was denied. Please allow location access and try again.',
  2: 'Location is unavailable right now. Please check GPS and try again.',
  3: 'Getting your location took too long. Please try again.'
};

const createEmergencyMessage = (latitude, longitude) => {
  const now = new Date();
  const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

  return `🚨 Emergency Alert – MemoryMate

Patient may need immediate assistance.

Current Location:
${mapsLink}

Date:
${now.toLocaleDateString()}

Time:
${now.toLocaleTimeString()}

Please reach the patient immediately.`;
};

const Emergency = () => {
  const { settings } = useContext(AppContext);
  const { speak } = useVoice();
  const t = translations[settings.language] || translations.en;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState('confirm');
  const [error, setError] = useState('');

  useEffect(() => {
    const message = settings.language === 'kn'
      ? 'Emergency page. Press the large red SOS button to send location on WhatsApp.'
      : 'Emergency Support page. Press the large red SOS button to send your location on WhatsApp.';

    const timer = setTimeout(() => speak(message), 800);
    return () => clearTimeout(timer);
  }, []);

  const hospitals = [
    { name: 'Jayanagar General Hospital', phone: '080-26531122', distance: '0.8 km' },
    { name: 'Apollo Specialty Hospital', phone: '080-4668 8888', distance: '1.5 km' },
    { name: 'Sagar Hospitals', phone: '080-4288 8888', distance: '2.3 km' }
  ];

  const resetDialog = () => {
    setDialogOpen(false);
    setStatus('confirm');
    setError('');
  };

  const openWhatsAppAlert = (latitude, longitude) => {
    const message = encodeURIComponent(createEmergencyMessage(latitude, longitude));
    const whatsappUrl = `https://wa.me/${CAREGIVER_WHATSAPP}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const sendSOSAlert = () => {
    setStatus('loading');
    setError('');
    speak('Getting your location...', true);

    if (!navigator.geolocation) {
      setStatus('error');
      setError('Location is not supported on this browser. Please call the caregiver.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStatus('sent');
        speak('Emergency WhatsApp alert is ready. Please send the message.', true);
        openWhatsAppAlert(latitude, longitude);
      },
      (geoError) => {
        setStatus('error');
        setError(locationErrorMessages[geoError.code] || 'Could not get your location. Please try again.');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24">
      <div className="bg-brand-cream-light border border-brand-cream-deep rounded-3xl p-6 shadow-soft text-center">
        <h1 className="text-3xl font-black text-brand-espresso flex items-center justify-center gap-2">
          <ShieldAlert className="text-red-600" />
          <span>{t.emergency.title}</span>
        </h1>
        <p className="text-brand-espresso/70 text-base mt-2">
          WhatsApp alert will include your current Google Maps location.
        </p>
      </div>

      <div className="bg-brand-cream-light border border-brand-cream-deep rounded-3xl p-6 md:p-8 shadow-soft flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => {
            setDialogOpen(true);
            setStatus('confirm');
            setError('');
          }}
          className="w-72 h-72 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-8 border-red-200 sos-glow cursor-pointer relative"
        >
          <AlertOctagon size={84} className="animate-pulse" />
          <span className="text-3xl font-black tracking-wider uppercase mt-4">
            🚨 SOS
          </span>
          <span className="text-2xl font-black mt-1">Need Help</span>
        </button>
        <p className="text-center text-lg font-bold text-brand-espresso/75">
          Sends location to {CAREGIVER_PHONE_DISPLAY} on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-cream-light border border-brand-cream-deep rounded-3xl p-6 shadow-soft flex gap-4">
          <div className="p-4 bg-brand-cream text-brand-espresso rounded-2xl h-fit">
            <MapPin size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-espresso mb-2">
              {settings.language === 'kn' ? 'ಮನೆಯ ವಿಳಾಸ' : 'Home Address'}
            </h3>
            <p className="text-brand-espresso/75 text-lg leading-relaxed">
              {t.emergency.mockAddress}
            </p>
          </div>
        </div>

        <div className="bg-brand-cream-light border border-brand-cream-deep rounded-3xl p-6 shadow-soft flex gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl h-fit">
            <Heart size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-espresso mb-2">
              {settings.language === 'kn' ? 'ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ' : 'Medical Details'}
            </h3>
            <p className="text-red-700 font-extrabold text-lg">
              {t.emergency.bloodGroup}
            </p>
            <p className="text-brand-espresso/75 text-lg mt-1 font-bold">
              {t.emergency.allergies}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-brand-cream-light border border-brand-cream-deep rounded-3xl p-6 shadow-soft">
        <h2 className="text-2xl font-black text-brand-espresso mb-4">
          {settings.language === 'kn' ? 'ಪಾಲಕರ ದೂರವಾಣಿ' : 'Caregiver Emergency Calls'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {settings.emergencyContacts.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.phone}`}
              className="flex items-center justify-between p-4 bg-brand-cream border border-brand-cream-deep rounded-2xl hover:bg-brand-cream-deep transition-all font-black text-xl text-brand-espresso"
            >
              <span>{contact.name}</span>
              <div className="p-3 bg-brand-espresso text-brand-cream-light rounded-xl">
                <Phone size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-brand-cream-light border border-brand-cream-deep rounded-3xl p-6 shadow-soft">
        <h2 className="text-2xl font-black text-brand-espresso mb-4">{t.emergency.nearestHospitals}</h2>
        <div className="flex flex-col gap-3">
          {hospitals.map((hosp, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-brand-cream-deep rounded-2xl hover:border-red-300 transition-colors"
            >
              <div>
                <h3 className="font-extrabold text-lg text-brand-espresso">{hosp.name}</h3>
                <p className="text-brand-espresso/60 text-sm mt-0.5">📍 {hosp.distance} away</p>
              </div>
              <a
                href={`tel:${hosp.phone}`}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-700 font-bold rounded-xl transition-colors"
              >
                <Phone size={18} />
                <span>{t.emergency.callHosp}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-espresso/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-brand-cream-deep bg-brand-cream-light p-6 text-center shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                  {status === 'loading' ? <Loader2 size={42} className="animate-spin" /> : <AlertCircle size={46} />}
                </div>
              </div>
              <button
                type="button"
                onClick={resetDialog}
                className="rounded-full bg-brand-cream p-2 text-brand-espresso hover:bg-brand-cream-deep"
                aria-label="Close SOS dialog"
              >
                <X size={22} />
              </button>
            </div>

            {status === 'confirm' && (
              <>
                <h2 className="mt-4 text-3xl font-black text-brand-espresso">Send emergency alert to caregiver?</h2>
                <p className="mt-3 text-lg font-semibold text-brand-espresso/70">
                  WhatsApp will open in a new tab with your Google Maps location.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={sendSOSAlert}
                    className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-red-600 px-5 py-4 text-xl font-black text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98]"
                  >
                    <Send size={24} />
                    <span>Send WhatsApp Alert</span>
                  </button>
                  <a
                    href={`tel:${CAREGIVER_PHONE_TEL}`}
                    className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-brand-cream-deep bg-brand-cream px-5 py-3 text-lg font-extrabold text-brand-espresso hover:bg-brand-cream-deep"
                  >
                    <Phone size={22} />
                    <span>Call caregiver</span>
                  </a>
                </div>
              </>
            )}

            {status === 'loading' && (
              <>
                <h2 className="mt-4 text-3xl font-black text-brand-espresso">Getting your location...</h2>
                <p className="mt-3 text-lg font-semibold text-brand-espresso/70">
                  Please allow location permission and keep this page open.
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <h2 className="mt-4 text-3xl font-black text-red-700">Location problem</h2>
                <p className="mt-3 text-lg font-semibold text-brand-espresso/75">{error}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={sendSOSAlert}
                    className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-red-600 px-5 py-4 text-xl font-black text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98]"
                  >
                    <RefreshCw size={24} />
                    <span>Retry location</span>
                  </button>
                  <a
                    href={`tel:${CAREGIVER_PHONE_TEL}`}
                    className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-brand-cream-deep bg-brand-cream px-5 py-3 text-lg font-extrabold text-brand-espresso hover:bg-brand-cream-deep"
                  >
                    <Phone size={22} />
                    <span>Call caregiver</span>
                  </a>
                </div>
              </>
            )}

            {status === 'sent' && (
              <>
                <h2 className="mt-4 text-3xl font-black text-brand-espresso">WhatsApp opened</h2>
                <p className="mt-3 text-lg font-semibold text-brand-espresso/70">
                  Check the new tab and press send in WhatsApp.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
