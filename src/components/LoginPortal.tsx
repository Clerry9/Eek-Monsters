import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ColorPalette } from '../types';
import { sound } from '../utils/audio';
import { Lock, UserPlus, Users, ArrowRight, ShieldCheck, CornerDownLeft, Sparkles, Smile, ShieldAlert } from 'lucide-react';

interface LoginPortalProps {
  palette: ColorPalette;
  onLoginSuccess: (profile: UserProfile) => void;
}

const RETRO_CLASSIFIED_AVATARS = [
  // Soldiers / Squad Cadets
  { emoji: '💂', label: 'ELITE GUARD', type: 'SOLDIER' },
  { emoji: '🥷', label: 'SHADOW NINJA', type: 'SOLDIER' },
  { emoji: '🤠', label: 'OUTLAW COYOTE', type: 'SOLDIER' },
  { emoji: '👮', label: 'TACTICAL FORCE', type: 'SOLDIER' },
  { emoji: '🦸', label: 'APEX COMMANDER', type: 'SOLDIER' },
  { emoji: '🤖', label: 'MECHA FIGHTER', type: 'SOLDIER' },
  { emoji: '🧑‍🚀', label: 'COSMIC MARINE', type: 'SOLDIER' },
  { emoji: '🕶️', label: 'SECRET INFR', type: 'SOLDIER' },
  { emoji: '⚔️', label: 'GLADIATOR REX', type: 'SOLDIER' },
  { emoji: '🛡️', label: 'TITAN DEFENDER', type: 'SOLDIER' },
  // Monsters / Alien Creepers
  { emoji: '👾', label: 'SPACE GLITCH', type: 'MONSTER' },
  { emoji: '👹', label: 'CYBER ONI', type: 'MONSTER' },
  { emoji: '👺', label: 'HELL GOBLIN', type: 'MONSTER' },
  { emoji: '💀', label: 'SKULL SPECTRE', type: 'MONSTER' },
  { emoji: '🧟', label: 'TOXIC CREEPER', type: 'MONSTER' },
  { emoji: '🧛', label: 'BLOOD COVENANT', type: 'MONSTER' },
  { emoji: '👽', label: 'NEBULA HORDE', type: 'MONSTER' },
  { emoji: '🐉', label: 'CHROME DRACO', type: 'MONSTER' },
  { emoji: '🦖', label: 'REX BEHEMOTH', type: 'MONSTER' },
  { emoji: '🐙', label: 'VOID OCTOPUS', type: 'MONSTER' },
];

export default function LoginPortal({ palette, onLoginSuccess }: LoginPortalProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [mode, setMode] = useState<'select' | 'create' | 'pin-entry'>('select');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(RETRO_CLASSIFIED_AVATARS[0].emoji);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [errorText, setErrorText] = useState('');

  // Selected profile for PIN entry
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [enteredPin, setEnteredPin] = useState('');

  // Load all profiles
  useEffect(() => {
    try {
      const stored = localStorage.getItem('eek_profiles');
      if (stored) {
        setProfiles(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load profiles', e);
    }
  }, []);

  const saveAndSelectProfile = (newProfile: UserProfile) => {
    try {
      const updatedList = [...profiles, newProfile];
      localStorage.setItem('eek_profiles', JSON.stringify(updatedList));
      setProfiles(updatedList);
      sound.playCoin();
      onLoginSuccess(newProfile);
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!username.trim()) {
      setErrorText('OPERATOR KEYCODE ID NAME CANNOT BE BLANK!');
      sound.playGatePass(false);
      return;
    }

    if (username.length > 15) {
      setErrorText('KEYCODE CODENAME EXCEEDS 15 CHARACTERS!');
      sound.playGatePass(false);
      return;
    }

    // Check duplicates
    if (profiles.some(p => p.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrorText('OPERATOR ALREADY EXISTS ON CODENAME SERVER!');
      sound.playGatePass(false);
      return;
    }

    // PIN check
    if (pin.trim() && pin.length !== 4) {
      setErrorText('SECURE PIN LOCK MUST BE 4 NUMBERS OR BLANK!');
      sound.playGatePass(false);
      return;
    }

    if (pin !== pinConfirm) {
      setErrorText('CONFIRM PIN MISMATCH!');
      sound.playGatePass(false);
      return;
    }

    const newProfile: UserProfile = {
      id: `operator_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      username: username.trim(),
      isGuest: false,
      avatar,
      pin: pin.trim() ? pin.trim() : undefined,
      createdAt: Date.now(),
    };

    saveAndSelectProfile(newProfile);
  };

  const handleGuestSignIn = () => {
    sound.playCoin();
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      username: `PATROL_GUEST_${guestId}`,
      isGuest: true,
      avatar: '👻',
      createdAt: Date.now(),
    };

    // Save Guest profiles locally so if they play they can reload their session, or they can just log out
    const updatedList = [...profiles.filter(p => !p.isGuest), guestProfile];
    try {
      localStorage.setItem('eek_profiles', JSON.stringify(updatedList));
    } catch (_) {}

    onLoginSuccess(guestProfile);
  };

  const handleSelectProfile = (profile: UserProfile) => {
    sound.playCoin();
    if (profile.pin) {
      setSelectedProfile(profile);
      setEnteredPin('');
      setErrorText('');
      setMode('pin-entry');
    } else {
      onLoginSuccess(profile);
    }
  };

  const handlePinSubmit = () => {
    if (!selectedProfile) return;
    if (enteredPin === selectedProfile.pin) {
      sound.playCoin();
      onLoginSuccess(selectedProfile);
    } else {
      setErrorText('SECURITY KEY PIN INCORRECT! RE-ENTER.');
      sound.playGatePass(false);
      setEnteredPin('');
    }
  };

  const handleBackspacePin = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    sound.playCoin();
  };

  const handleKeypadPress = (num: string) => {
    if (enteredPin.length < 4) {
      sound.playCoin();
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        // Automatically check if accurate or let user press execute
        setTimeout(() => {
          if (nextPin === selectedProfile?.pin) {
            sound.playCoin();
            onLoginSuccess(selectedProfile);
          } else {
            setErrorText('SECURITY PIN INCORRECT!');
            sound.playGatePass(false);
            setEnteredPin('');
          }
        }, 150);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-lg mx-auto relative ${palette.bgBgClass} scanlines overflow-y-auto pb-6 select-none`}>
      {/* Glow radial at bottom */}
      <div className="absolute inset-0 bg-radial-at-b from-red-950/15 via-transparent to-transparent pointer-events-none" />

      {/* Header Info badge */}
      <div className={`w-full flex justify-between items-center px-4 py-3 border-b z-20 shrink-0 ${palette.bgMenuClass} ${palette.borderClass}`}>
        <div className={`flex items-center space-x-1.5 border px-2 py-1 rounded-md bg-slate-900 border-slate-950`}>
          <span className="text-yellow-400 text-xs animate-pulse">📡</span>
          <span className="font-mono text-[8px] font-bold text-slate-400 uppercase tracking-widest">ARCADE CODENAME TERMINAL 1.0</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 mt-4 z-10">
        
        {/* Main Badge Graphic */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6 flex flex-col items-center"
        >
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded border border-red-800 bg-red-950 bg-red-950/80 mb-1">
            <span className="text-[7px] font-mono tracking-widest font-extrabold text-red-500 uppercase animate-pulse">ARCADE LINK SECURE</span>
          </div>
          <h2 className={`text-2xl font-black drop-shadow-[2px_2px_0px_#000] uppercase tracking-tighter ${palette.hudTextClass}`}>
            OPERATOR <span className="text-yellow-400">ACCESS</span>
          </h2>
          <p className="text-slate-400 text-[9px] max-w-xs leading-normal font-mono uppercase mt-1">
            Sign in to calibrate multipliers, earn global scores, and buy premium armaments.
          </p>
        </motion.div>

        {/* Dynamic Inner Portal View Container */}
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="select-profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md flex flex-col gap-4 text-left"
            >
              <div className={`p-4 rounded-2xl border-2 border-dashed ${palette.cardClass} flex flex-col gap-3 min-h-[220px]`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className={`text-[9px] font-mono font-black uppercase flex items-center gap-1 ${palette.textClass}`}>
                    <Users size={12} className="text-yellow-400" /> INSTALLED OPERATOR CARDS
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-mono">[{profiles.length} ACTIVE]</span>
                </div>

                {profiles.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-[9.5px] uppercase gap-1.5">
                    <span>⚠️ NO OPERATORS INSTALLED ON MEMORY CHIP 1</span>
                    <span className="text-[8px] text-slate-600">PLEASE CLICK 'REGISTER' OR 'GUEST SIGN IN' BELOW</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                    {profiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => handleSelectProfile(profile)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left active:scale-98 transition group cursor-pointer ${palette.cardClass} hover:border-yellow-400`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl inline-block p-1 bg-slate-900 border border-slate-850 rounded-lg group-hover:scale-110 transition">{profile.avatar}</span>
                          <div>
                            <div className={`text-[11px] font-black uppercase ${palette.textClass} flex items-center gap-1`}>
                              {profile.username}
                              {profile.pin && <Lock size={10} className="text-yellow-500" />}
                            </div>
                            <span className="text-[7.5px] text-slate-500 font-mono block">
                              DEPLOYED: {new Date(profile.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action grid options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    sound.playCoin();
                    setMode('create');
                    setErrorText('');
                    setUsername('');
                    setPin('');
                    setPinConfirm('');
                  }}
                  className={`border-2 py-3 px-4 rounded-xl font-mono text-[10px] font-extrabold uppercase flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer hover:border-yellow-500 ${palette.cardClass} ${palette.textClass}`}
                >
                  <UserPlus size={13} className="text-yellow-400" /> REGISTER ID
                </button>

                <button
                  onClick={handleGuestSignIn}
                  className={`py-3 px-4 rounded-xl font-mono text-[10px] font-extrabold uppercase flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer border-2 bg-yellow-400 text-slate-950 border-yellow-500 font-black`}
                >
                  <Sparkles size={13} className="animate-pulse" /> GUEST PLAY
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create-profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md flex flex-col gap-4 text-left"
            >
              <form onSubmit={handleCreateAccount} className={`p-4 rounded-2xl border-2 ${palette.cardClass} flex flex-col gap-3 font-mono`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${palette.textClass}`}>
                    <UserPlus size={12} className="text-yellow-400" /> ENLIST NEW CLONE COMMANDO ID
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playCoin();
                      setMode('select');
                      setErrorText('');
                    }}
                    className="text-[8px] text-red-500 underline uppercase"
                  >
                    CANCEL
                  </button>
                </div>

                {/* Nickname Input */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase">CODENAME (NICKNAME):</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER ALIAS..."
                    className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-[10.5px] uppercase tracking-wider font-mono focus:outline-none focus:border-yellow-400"
                    maxLength={15}
                  />
                </div>

                {/* Select Avatar Classified Grid Layout */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[8.5px] font-bold text-slate-450 text-slate-400 uppercase">CHOOSE RETRO PROFILE AVATAR:</label>
                    <span className="text-[7.5px] font-black text-yellow-400 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded-md uppercase animate-pulse">
                      ACTIVE: {avatar} {RETRO_CLASSIFIED_AVATARS.find(a => a.emoji === avatar)?.label || 'CLASS'}
                    </span>
                  </div>

                  {/* SOLDIERS GRID */}
                  <div className="flex flex-col gap-1 p-2 bg-slate-950/20 border border-slate-905 border-slate-900 rounded-xl">
                    <span className="text-[7px] text-slate-500 font-black tracking-wider uppercase flex items-center gap-1">
                      🛡️ CLONE INFANTRY & SECURE SOLDIERS
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 mt-1">
                      {RETRO_CLASSIFIED_AVATARS.filter(a => a.type === 'SOLDIER').map((av) => (
                        <button
                          key={av.emoji}
                          type="button"
                          onClick={() => {
                            sound.playCoin();
                            setAvatar(av.emoji);
                          }}
                          className={`text-xl p-2 rounded-xl transition duration-150 flex items-center justify-center relative group/btn cursor-pointer ${
                            avatar === av.emoji 
                              ? 'bg-yellow-400/20 border-yellow-400 border-2 scale-105 shadow shadow-yellow-400/20' 
                              : 'bg-slate-950 border border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <span>{av.emoji}</span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/btn:block bg-slate-950 border border-slate-800 text-slate-300 text-[6px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider whitespace-nowrap z-50 shadow-md">
                            {av.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MONSTERS GRID */}
                  <div className="flex flex-col gap-1 p-2 bg-slate-950/20 border border-slate-905 border-slate-900 rounded-xl">
                    <span className="text-[7px] text-slate-500 font-black tracking-wider uppercase flex items-center gap-1">
                      👾 ALIEN MUTANTS & BOSS BEAST SPECIMENS
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 mt-1">
                      {RETRO_CLASSIFIED_AVATARS.filter(a => a.type === 'MONSTER').map((av) => (
                        <button
                          key={av.emoji}
                          type="button"
                          onClick={() => {
                            sound.playCoin();
                            setAvatar(av.emoji);
                          }}
                          className={`text-xl p-2 rounded-xl transition duration-150 flex items-center justify-center relative group/btn cursor-pointer ${
                            avatar === av.emoji 
                              ? 'bg-yellow-400/20 border-yellow-400 border-2 scale-105 shadow shadow-yellow-400/20' 
                              : 'bg-slate-950 border border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <span>{av.emoji}</span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/btn:block bg-slate-950 border border-slate-800 text-slate-300 text-[6px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider whitespace-nowrap z-50 shadow-md">
                            {av.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional Pin Locks */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[7.5px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Lock size={10} className="text-yellow-500" /> SECURE PIN (4-NUMS):
                    </label>
                    <input
                      type="password"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={pin}
                      placeholder="LEAVE EMPTY"
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-center font-mono focus:outline-none focus:border-yellow-400 text-xs"
                      maxLength={4}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[7.5px] font-bold text-slate-400 uppercase">CONFIRM PIN LOCK:</label>
                    <input
                      type="password"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={pinConfirm}
                      placeholder="FOR SECURITY"
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-center font-mono focus:outline-none focus:border-yellow-400 text-xs"
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorText && (
                  <div className="bg-red-950/80 border border-red-800/80 text-red-400 text-[8.5px] p-2 rounded-lg flex items-center gap-1.5 animate-bounce">
                    <ShieldAlert size={12} className="shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition mt-2 cursor-pointer text-center flex items-center justify-center gap-1.5 bg-green-500 text-slate-950 border border-green-600`}
                >
                  <Smile size={13} /> CONFIRM ENLISTMENT
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'pin-entry' && selectedProfile && (
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm flex flex-col gap-4 text-left"
            >
              <div className={`p-4 rounded-2xl border-2 ${palette.cardClass} flex flex-col gap-4 font-mono items-center`}>
                <div className="w-full flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${palette.textClass}`}>
                    <Lock size={12} className="text-yellow-500 animate-pulse" /> ENTER PIN FOR {selectedProfile.username}
                  </span>
                  <button
                    onClick={() => {
                      sound.playCoin();
                      setMode('select');
                      setErrorText('');
                    }}
                    className="text-[8px] text-red-500 underline uppercase"
                  >
                    GO BACK
                  </button>
                </div>

                <div className="text-3xl p-2 tracking-widest bg-slate-950 border border-slate-900 rounded-xl w-32 text-center text-yellow-400 font-bold h-12 flex items-center justify-center">
                  {'*'.repeat(enteredPin.length) || '_ '}
                </div>

                {/* Numeric Safe Keypad for easy inputs */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 py-2.5 rounded-lg text-xs font-black active:scale-95 transition cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleBackspacePin}
                    className="bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/60 py-2.5 rounded-lg text-[9px] font-black active:scale-95 transition cursor-pointer"
                  >
                    DEL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 py-2.5 rounded-lg text-xs font-black active:scale-95 transition cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handlePinSubmit}
                    disabled={enteredPin.length !== 4}
                    className={`text-[8px] font-black rounded-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-0.5 ${enteredPin.length === 4 ? 'bg-green-500 text-slate-950 border-green-600' : 'bg-slate-800 text-slate-500 border-slate-850 cursor-not-allowed'}`}
                  >
                    <CornerDownLeft size={10} /> ENT
                  </button>
                </div>

                {errorText && (
                  <div className="bg-red-950/80 border border-red-800/80 text-red-400 text-[8.5px] p-2 rounded-lg flex items-center gap-1.5 w-full text-center justify-center">
                    <ShieldAlert size={12} className="shrink-0 animate-bounce" />
                    <span>{errorText}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini regulatory disclaimer footer */}
      <div className="text-center font-mono text-[7px] text-slate-500 px-10 mt-3 shrink-0 py-2 uppercase leading-relaxed">
        Arcade local memory slot chips are kept up to date internally. Multi-operator profiles allows sharing offline game progress safely.
      </div>
    </div>
  );
}
