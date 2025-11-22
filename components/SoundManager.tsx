import React, { useEffect, useRef } from 'react';

interface SoundManagerProps {
  playSound: { type: string; id: number } | null;
}

const SoundManager: React.FC<SoundManagerProps> = ({ playSound }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
          audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  const playChipSound = (ctx: AudioContext) => {
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     // Short high pitch 'clack'
     osc.type = 'sine';
     osc.frequency.setValueAtTime(1200, ctx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
     
     gain.gain.setValueAtTime(0.1, ctx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start();
     osc.stop(ctx.currentTime + 0.1);
  };

  const playSpinSound = (ctx: AudioContext) => {
      // Duration approx 4s
      const duration = 3.8;
      
      // 1. Rolling texture (Low frequency FM synthesis)
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const gain = ctx.createGain();
      const modGain = ctx.createGain();

      carrier.frequency.setValueAtTime(100, ctx.currentTime);
      modulator.frequency.setValueAtTime(50, ctx.currentTime); // Roughness
      modGain.gain.value = 500; 

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5); // Fade in
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration); // Fade out

      carrier.start();
      modulator.start();
      carrier.stop(ctx.currentTime + duration);
      modulator.stop(ctx.currentTime + duration);

      // 2. Ticks (Ball hitting frets/diamonds)
      // We generate a sequence of ticks that slow down quadratically
      const numberOfTicks = 25;
      for(let i=0; i<numberOfTicks; i++) {
          // Calculate timing: start fast, end slow
          // ratio goes from 0 to 1
          const ratio = i / numberOfTicks;
          
          // Use a power function to space them out
          // t will be distributed from 0 to duration
          const timeOffset = (Math.pow(ratio, 1.5)) * duration; 
          
          const t = ctx.currentTime + timeOffset;
          
          if (t > ctx.currentTime + duration) continue;

          const tickOsc = ctx.createOscillator();
          const tickGain = ctx.createGain();
          
          tickOsc.frequency.value = 1800 - (ratio * 1000); // Pitch drops slightly as it slows
          tickOsc.type = 'triangle';
          
          tickGain.gain.setValueAtTime(0.05, t);
          tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
          
          tickOsc.connect(tickGain);
          tickGain.connect(ctx.destination);
          
          tickOsc.start(t);
          tickOsc.stop(t + 0.05);
      }
  };

  const playWinSound = (ctx: AudioContext) => {
      // Bright Major Arpeggio (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          const t = ctx.currentTime + index * 0.1;
          
          osc.frequency.value = freq;
          osc.type = 'sine';
          
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(t);
          osc.stop(t + 0.6);
      });

      // Add a little "shimmer" with high triangle waves
      const shimOsc = ctx.createOscillator();
      const shimGain = ctx.createGain();
      shimOsc.type = 'triangle';
      shimOsc.frequency.setValueAtTime(1046.50, ctx.currentTime);
      shimOsc.frequency.linearRampToValueAtTime(2093, ctx.currentTime + 0.4);
      shimGain.gain.setValueAtTime(0.05, ctx.currentTime);
      shimGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      
      shimOsc.connect(shimGain);
      shimGain.connect(ctx.destination);
      shimOsc.start();
      shimOsc.stop(ctx.currentTime + 0.4);
  };

  useEffect(() => {
    if (!playSound) return;
    
    initAudio();
    const ctx = audioCtxRef.current;
    if (ctx) {
        // Resume if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
             ctx.resume();
        }

        try {
            if (playSound.type === 'bet') playChipSound(ctx);
            if (playSound.type === 'spin') playSpinSound(ctx);
            if (playSound.type === 'win') playWinSound(ctx);
        } catch (e) {
            console.error("Audio playback error", e);
        }
    }
  }, [playSound]);

  return null;
};

export default SoundManager;
