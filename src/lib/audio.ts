/**
 * Audio utility for notification sounds using Web Audio API.
 * This avoids the need for external assets.
 */

export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant "ding" sound
    const playDing = (time: number, freq: number, duration: number, volume: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = audioContext.currentTime;
    
    // Play two notes for a "complete" feel
    playDing(now, 523.25, 0.4, 0.1); // C5
    playDing(now + 0.1, 659.25, 0.5, 0.1); // E5
    
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};
