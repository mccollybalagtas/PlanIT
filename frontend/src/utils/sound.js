let audioContext = null;
let audioEnabled = true;

const createOscillator = (frequency, duration, type = 'sine') => {
  if (typeof window === 'undefined' || !audioEnabled) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (err) {
    console.error('Sound playback failed:', err);
  }
};

export const playSound = {
  taskComplete: () => createOscillator(523, 0.15),
  notification: () => {
    createOscillator(660, 0.1, 'square');
    setTimeout(() => createOscillator(880, 0.1, 'square'), 100);
  },
  error: () => createOscillator(220, 0.3, 'square'),
  click: () => createOscillator(440, 0.05),
};

export const enableSound = (enabled = true) => {
  audioEnabled = enabled;
};

export const initAudio = async () => {
  if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  }
};
