// Sound effects using Web Audio API
const sound = {
    enabled: false,
    audioCtx: null,
    volume: 0.1,

    init() {
        // Check localStorage for preference
        this.enabled = localStorage.getItem('sound_enabled') === 'true';
    },

    getContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled.toString());
        return this.enabled;
    },

    // Typewriter click sound
    typeClick() {
        if (!this.enabled) return;

        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Short high-frequency click
        osc.frequency.value = 800 + Math.random() * 200;
        osc.type = 'square';

        gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain.gain.exponentialDecayTo = gain.gain.exponentialRampToValueAtTime || gain.gain.setValueAtTime;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
    },

    // Split-flap mechanical flip sound
    flip() {
        if (!this.enabled) return;

        const ctx = this.getContext();
        const now = ctx.currentTime;

        // Create noise buffer for the mechanical "clack"
        const bufferSize = ctx.sampleRate * 0.04; // 40ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate noise with quick decay
        for (let i = 0; i < bufferSize; i++) {
            const decay = Math.exp(-i / (bufferSize * 0.1));
            data[i] = (Math.random() * 2 - 1) * decay;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter for that plastic/mechanical sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000 + Math.random() * 500;
        filter.Q.value = 2;

        // Add a quick low "thunk"
        const thunk = ctx.createOscillator();
        thunk.frequency.value = 150 + Math.random() * 50;
        thunk.type = 'sine';

        const thunkGain = ctx.createGain();
        thunkGain.gain.setValueAtTime(this.volume * 0.4, now);
        thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        // Main noise gain
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(this.volume * 0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        // Connect
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        thunk.connect(thunkGain);
        thunkGain.connect(ctx.destination);

        // Play
        noise.start(now);
        noise.stop(now + 0.04);
        thunk.start(now);
        thunk.stop(now + 0.02);
    },

    // Enter/submit sound
    enter() {
        if (!this.enabled) return;

        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Lower beep
        osc.frequency.value = 400;
        osc.type = 'sine';

        gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    },

    // Error sound
    error() {
        if (!this.enabled) return;

        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 200;
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    },

    // Success sound (two-tone)
    success() {
        if (!this.enabled) return;

        const ctx = this.getContext();

        // First tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.value = 523; // C5
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.1);

        // Second tone (higher)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 659; // E5
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.2);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => sound.init());
