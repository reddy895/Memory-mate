import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import { useVoice } from '../hooks/useVoice';
import { Brain, Trophy, RotateCcw, Award, CheckCircle2, Play } from 'lucide-react';

const BrainGym = () => {
  const { settings, family } = useContext(AppContext);
  const { speak } = useVoice();
  const t = translations[settings.language] || translations.en;

  const [activeGame, setActiveGame] = useState('match'); // 'match', 'colors', 'quiz'

  // ==========================================
  // GAME 1: MEMORY MATCH CARDS
  // ==========================================
  const CARD_EMOJIS = ['🍎', '🍎', '🍌', '🍌', '🍒', '🍒', '🍇', '🍇'];
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]); // indices
  const [matchedCards, setMatchedCards] = useState([]); // emojis
  const [matchTurns, setMatchTurns] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [matchWon, setMatchWon] = useState(false);

  const initMatchGame = () => {
    // Shuffle cards
    const shuffled = [...CARD_EMOJIS]
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setCards(shuffled);
    setSelectedCards([]);
    setMatchedCards([]);
    setMatchTurns(0);
    setMatchScore(0);
    setMatchWon(false);
  };

  useEffect(() => {
    if (activeGame === 'match') {
      initMatchGame();
    }
  }, [activeGame]);

  const handleCardClick = (index) => {
    if (selectedCards.length === 2 || matchedCards.includes(cards[index]) || selectedCards.includes(index) || matchWon) return;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMatchTurns(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      
      if (cards[firstIdx] === cards[secondIdx]) {
        // Matched!
        setMatchedCards(prev => [...prev, cards[firstIdx]]);
        setMatchScore(prev => prev + 10);
        setSelectedCards([]);
        speak(settings.language === 'kn' ? "ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ!" : "Matched!");

        if (matchedCards.length + 1 === CARD_EMOJIS.length / 2) {
          setMatchWon(true);
          speak(t.brain.winMsg);
        }
      } else {
        // No match - reset selected after 1.2s
        setTimeout(() => {
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  // ==========================================
  // GAME 2: COLOR SEQUENCE MEMORY
  // ==========================================
  const COLOR_KEYS = ['red', 'blue', 'green', 'yellow'];
  const COLOR_CLASSES = {
    red: { normal: 'bg-red-500 hover:bg-red-600', active: 'bg-red-300 ring-8 ring-red-200 scale-105 shadow-lg border-white', hex: '#EF4444' },
    blue: { normal: 'bg-blue-500 hover:bg-blue-600', active: 'bg-blue-300 ring-8 ring-blue-200 scale-105 shadow-lg border-white', hex: '#3B82F6' },
    green: { normal: 'bg-emerald-500 hover:bg-emerald-600', active: 'bg-emerald-300 ring-8 ring-emerald-200 scale-105 shadow-lg border-white', hex: '#10B981' },
    yellow: { normal: 'bg-yellow-500 hover:bg-yellow-600', active: 'bg-yellow-300 ring-8 ring-yellow-200 scale-105 shadow-lg border-white', hex: '#F59E0B' },
  };

  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [colorScore, setColorScore] = useState(0);
  const [activeColor, setActiveColor] = useState(null);
  const [colorGameState, setColorGameState] = useState('idle'); // 'idle', 'showing', 'listening', 'gameover'

  const startColorGame = () => {
    setColorScore(0);
    setSequence([]);
    setUserSequence([]);
    setColorGameState('showing');
    addNewColorToSequence([]);
  };

  const addNewColorToSequence = (currentSeq) => {
    const randomColor = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    const newSeq = [...currentSeq, randomColor];
    setSequence(newSeq);
    playSequence(newSeq);
  };

  const playSequence = async (seq) => {
    setColorGameState('showing');
    speak(settings.language === 'kn' ? "ಗಮನಿಸಿ..." : "Watch the sequence...");
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const color = seq[i];
      setActiveColor(color);
      speak(t.brain.colors[color]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(null);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setColorGameState('listening');
    setUserSequence([]);
    speak(settings.language === 'kn' ? "ನಿಮ್ಮ ಸರದಿ, ಒತ್ತಿ." : "Your turn! Repeat the colors.");
  };

  const handleColorClick = (color) => {
    if (colorGameState !== 'listening') return;

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 250);

    const newUserSeq = [...userSequence, color];
    setUserSequence(newUserSeq);

    // Check correctness
    const currentStep = newUserSeq.length - 1;
    if (newUserSeq[currentStep] !== sequence[currentStep]) {
      // Wrong sequence
      setColorGameState('gameover');
      speak(settings.language === 'kn' ? "ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." : "Oops! Incorrect sequence.");
      return;
    }

    if (newUserSeq.length === sequence.length) {
      // Completed current level
      setColorScore(prev => prev + 1);
      speak(settings.language === 'kn' ? "ಸರಿಯಾಗಿದೆ!" : "Correct!");
      setTimeout(() => {
        addNewColorToSequence(sequence);
      }, 1000);
    }
  };

  // ==========================================
  // GAME 3: FAMILIAR FACES QUIZ
  // ==========================================
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const initQuizGame = () => {
    if (family.length === 0) return;
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    loadQuizQuestion(0);
  };

  const loadQuizQuestion = (index) => {
    if (index >= family.length) {
      setQuizFinished(true);
      speak(settings.language === 'kn' 
        ? `ಅದ್ಭುತ! ರಸಪ್ರಶ್ನೆ ಮುಗಿದಿದೆ. ನಿಮ್ಮ ಅಂಕಗಳು ${quizScore}` 
        : `Well done! Quiz complete. Your score is ${quizScore}`);
      return;
    }
    const correctMember = family[index];
    setSelectedQuizOption(null);
    setQuizAnswered(false);

    // Build unique options list (including the correct member)
    const options = [correctMember];
    
    // Fill up with other members
    const otherMembers = family.filter(f => f.id !== correctMember.id);
    const shuffledOthers = [...otherMembers].sort(() => Math.random() - 0.5);
    
    shuffledOthers.forEach(m => {
      if (options.length < 3) {
        options.push(m);
      }
    });

    // Shuffle the options
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    
    const introMsg = settings.language === 'kn'
      ? "ಈ ಫೋಟೋದಲ್ಲಿರುವ ಕುಟುಂಬದ ಸದಸ್ಯ ಯಾರು?"
      : "Who is this family member in the photo?";
    speak(introMsg);
  };

  const handleQuizAnswer = (member) => {
    if (quizAnswered) return;

    setSelectedQuizOption(member.id);
    setQuizAnswered(true);

    const correctMember = family[currentQuizIndex];
    if (member.id === correctMember.id) {
      setQuizScore(prev => prev + 10);
      speak(t.brain.quiz.correct);
    } else {
      speak(t.brain.quiz.wrong);
    }
  };

  const handleNextQuiz = () => {
    const nextIdx = currentQuizIndex + 1;
    setCurrentQuizIndex(nextIdx);
    loadQuizQuestion(nextIdx);
  };

  useEffect(() => {
    if (activeGame === 'quiz') {
      initQuizGame();
    }
  }, [activeGame]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24">
      {/* Header Info */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-soft text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
            <span>🧠</span> {t.brain.title}
          </h1>
          <p className="text-slate-500 text-base mt-2">
            {t.brain.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 font-extrabold text-lg px-4 py-2 rounded-2xl">
          <Trophy className="text-yellow-600 animate-pulse-slow" />
          <span>
            {settings.language === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು' : 'Score'}: {
              activeGame === 'match' ? matchScore : 
              activeGame === 'colors' ? colorScore * 10 : 
              quizScore
            }
          </span>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveGame('match')}
          className={`p-4 rounded-xl font-bold text-base md:text-lg transition-all ${
            activeGame === 'match'
              ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🎴 {settings.language === 'kn' ? 'ಕಾರ್ಡ್ ಆಟ' : 'Card Match'}
        </button>
        <button
          onClick={() => setActiveGame('colors')}
          className={`p-4 rounded-xl font-bold text-base md:text-lg transition-all ${
            activeGame === 'colors'
              ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🎨 {settings.language === 'kn' ? 'ಬಣ್ಣಗಳು' : 'Colors Repeat'}
        </button>
        <button
          onClick={() => setActiveGame('quiz')}
          className={`p-4 rounded-xl font-bold text-base md:text-lg transition-all ${
            activeGame === 'quiz'
              ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          👥 {settings.language === 'kn' ? 'ರಸಪ್ರಶ್ನೆ' : 'Faces Quiz'}
        </button>
      </div>

      {/* GAME 1 CONTENT: MEMORY CARD MATCH */}
      {activeGame === 'match' && (
        <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-soft flex flex-col items-center gap-6">
          <div className="flex justify-between w-full border-b border-slate-100 pb-4">
            <span className="text-slate-600 font-extrabold text-lg">
              {t.brain.turns}: {matchTurns}
            </span>
            <button
              onClick={initMatchGame}
              className="flex items-center gap-2 text-brand-sky-dark font-extrabold hover:underline"
            >
              <RotateCcw size={18} />
              <span>{t.playAgain}</span>
            </button>
          </div>

          {matchWon ? (
            <div className="text-center py-10 flex flex-col items-center gap-4 bg-emerald-50 rounded-3xl w-full border border-emerald-100 animate-scale-up">
              <Award size={72} className="text-emerald-500 animate-bounce" />
              <h2 className="text-3xl font-black text-emerald-800">{t.brain.winMsg}</h2>
              <p className="text-slate-600 text-lg">
                {settings.language === 'kn' 
                  ? `ನೀವು ಇದನ್ನು ${matchTurns} ಸರದಿಯಲ್ಲಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ!` 
                  : `You completed it in ${matchTurns} turns!`}
              </p>
              <button
                onClick={initMatchGame}
                className="mt-4 px-6 py-3 bg-brand-mint-dark hover:bg-brand-mint-hover text-white font-bold rounded-2xl shadow-soft"
              >
                {t.playAgain}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 w-full max-w-md aspect-square">
              {cards.map((emoji, index) => {
                const isSelected = selectedCards.includes(index);
                const isMatched = matchedCards.includes(emoji);
                const isFlipped = isSelected || isMatched;

                return (
                  <button
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className={`aspect-square rounded-2xl border-4 text-4xl flex items-center justify-center transition-all duration-300 font-bold ${
                      isFlipped
                        ? 'bg-sky-50 border-sky-400 rotate-y-180 scale-100'
                        : 'bg-gradient-to-br from-sky-400 to-sky-600 border-white hover:scale-105 shadow-md active:scale-95 text-white'
                    }`}
                  >
                    <span className={isFlipped ? 'opacity-100 block' : 'opacity-0'}>
                      {emoji}
                    </span>
                    {!isFlipped && <span className="text-2xl font-black">?</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GAME 2 CONTENT: COLOR SEQUENCE MEMORY */}
      {activeGame === 'colors' && (
        <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-soft flex flex-col items-center gap-6">
          <div className="flex justify-between w-full border-b border-slate-100 pb-4">
            <span className="text-slate-600 font-extrabold text-lg">
              {settings.language === 'kn' ? 'ಹಂತ' : 'Level'}: {sequence.length || 1}
            </span>
            {colorGameState === 'gameover' && (
              <button
                onClick={startColorGame}
                className="flex items-center gap-2 text-brand-sky-dark font-extrabold hover:underline"
              >
                <RotateCcw size={18} />
                <span>{settings.language === 'kn' ? 'ಮತ್ತೆ ಆಡಿ' : 'Retry'}</span>
              </button>
            )}
          </div>

          {colorGameState === 'idle' ? (
            <div className="text-center py-10 flex flex-col items-center gap-4">
              <div className="p-4 bg-sky-50 text-brand-sky-dark rounded-full">
                <Brain size={48} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                {settings.language === 'kn' ? 'ಬಣ್ಣಗಳ ಸರಣಿ ನೆನಪಿನ ಆಟ' : 'Repeat the Color Patterns'}
              </h2>
              <p className="text-slate-500 text-lg max-w-sm">
                {settings.language === 'kn'
                  ? 'ಬಣ್ಣಗಳು ಬೆಳಗುವುದನ್ನು ಗಮನಿಸಿ ಮತ್ತು ಅದೇ ಕ್ರಮದಲ್ಲಿ ಅವುಗಳನ್ನು ಒತ್ತಿ.'
                  : 'Watch the sequence carefully and then tap the matching colored buttons.'}
              </p>
              <button
                onClick={startColorGame}
                className="mt-4 px-8 py-4 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-bold text-xl rounded-2xl flex items-center gap-2 shadow-soft"
              >
                <Play size={20} fill="#FFF" />
                <span>{settings.language === 'kn' ? 'ಆಟ ಪ್ರಾರಂಭಿಸಿ' : 'Start Game'}</span>
              </button>
            </div>
          ) : colorGameState === 'gameover' ? (
            <div className="text-center py-10 flex flex-col items-center gap-4 bg-red-50 rounded-3xl w-full border border-red-150 animate-scale-up">
              <RotateCcw size={64} className="text-red-500" />
              <h2 className="text-3xl font-black text-red-800">
                {settings.language === 'kn' ? 'ತಪ್ಪಾದ ಉತ್ತರ!' : 'Game Over!'}
              </h2>
              <p className="text-slate-600 text-lg">
                {settings.language === 'kn'
                  ? `ನಿಮ್ಮ ಕೊನೆಯ ಸ್ಕೋರ್: ${colorScore * 10}`
                  : `Your final score: ${colorScore * 10}`}
              </p>
              <button
                onClick={startColorGame}
                className="mt-4 px-6 py-3 bg-red-650 hover:bg-red-700 text-white font-bold rounded-2xl shadow-soft"
              >
                {t.playAgain}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="text-lg font-black text-slate-600 uppercase tracking-widest bg-slate-100 rounded-full px-5 py-2 border border-slate-200">
                {colorGameState === 'showing' 
                  ? (settings.language === 'kn' ? 'ಗಮನಿಸಿ...' : 'Watch closely...') 
                  : (settings.language === 'kn' ? 'ನಿಮ್ಮ ಸರದಿ!' : 'Repeat the sequence!')}
              </div>

              {/* Simon 4 Buttons grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm aspect-square">
                {COLOR_KEYS.map((color) => {
                  const isActive = activeColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorClick(color)}
                      disabled={colorGameState !== 'listening'}
                      className={`aspect-square rounded-3xl border-4 border-slate-100 transition-all duration-150 ${
                        isActive 
                          ? COLOR_CLASSES[color].active 
                          : COLOR_CLASSES[color].normal
                      } cursor-pointer shadow-md`}
                      aria-label={`Color button ${color}`}
                    ></button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 3 CONTENT: FAMILIAR FACES QUIZ */}
      {activeGame === 'quiz' && (
        <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-soft flex flex-col items-center gap-6">
          {family.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-bold">Please add family members first in Caregiver Portal.</p>
            </div>
          ) : quizFinished ? (
            <div className="text-center py-10 flex flex-col items-center gap-4 bg-emerald-50 rounded-3xl w-full border border-emerald-100 animate-scale-up">
              <CheckCircle2 size={72} className="text-emerald-500 animate-bounce" />
              <h2 className="text-3xl font-black text-emerald-800">
                {settings.language === 'kn' ? 'ಮುಗಿದಿದೆ!' : 'Fantastic Work!'}
              </h2>
              <p className="text-slate-600 text-lg">
                {settings.language === 'kn'
                  ? `ನೀವು ಎಲ್ಲಾ ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸರಿಯಾಗಿ ಗುರುತಿಸಿದ್ದೀರಿ! ಅಂಕಗಳು: ${quizScore}`
                  : `You completed the quiz! Final score: ${quizScore}`}
              </p>
              <button
                onClick={initQuizGame}
                className="mt-4 px-6 py-3 bg-brand-mint-dark hover:bg-brand-mint-hover text-white font-bold rounded-2xl shadow-soft"
              >
                {t.playAgain}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Question description */}
              <h2 className="text-2xl font-black text-slate-800 text-center">
                {t.brain.quiz.question}
              </h2>

              {/* Photo to Quiz */}
              <div className="w-56 h-56 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-sky-50 flex items-center justify-center animate-scale-up">
                <img
                  src={family[currentQuizIndex]?.photo}
                  alt="Quiz family member"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full hidden bg-sky-100 text-sky-700 text-6xl font-black items-center justify-center">
                  ?
                </div>
              </div>

              {/* Option Choice Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-sm mt-3">
                {quizOptions.map((option) => {
                  const isCorrect = option.id === family[currentQuizIndex]?.id;
                  const isSelected = selectedQuizOption === option.id;

                  let btnStyle = 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white';
                  if (quizAnswered) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200';
                    } else if (isSelected) {
                      btnStyle = 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200';
                    } else {
                      btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleQuizAnswer(option)}
                      disabled={quizAnswered}
                      className={`p-4 border-2 rounded-2xl font-extrabold text-xl transition-all flex items-center justify-center gap-3 ${btnStyle}`}
                    >
                      {quizAnswered && isCorrect && <span>✅</span>}
                      {quizAnswered && isSelected && !isCorrect && <span>❌</span>}
                      <span>
                        {settings.language === 'kn' ? (option.nameKn || option.name) : option.name} ({settings.language === 'kn' ? (option.relationKn || option.relation) : option.relation})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Next Question Navigation */}
              {quizAnswered && (
                <button
                  onClick={handleNextQuiz}
                  className="mt-4 px-6 py-3 bg-brand-sky-dark hover:bg-brand-sky-hover text-white font-bold text-lg rounded-2xl shadow-soft"
                >
                  {t.brain.quiz.next} →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrainGym;
