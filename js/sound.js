// Sound effects using Web Audio API
const sound = {
    enabled: false,
    audioCtx: null,
    flipBuffer: null,
    volume: 0.3,

    init() {
        // Check localStorage for preference
        this.enabled = localStorage.getItem('sound_enabled') === 'true';
        // Preload flip sound
        this.loadFlipSound();
    },

    async loadFlipSound() {
        try {
            const response = await fetch('assets/flip.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const ctx = this.getContext();
            this.flipBuffer = await ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.log('Could not load flip sound:', e);
        }
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

    // Split-flap mechanical flip sound (uses preloaded audio file)
    flip() {
        if (!this.enabled || !this.flipBuffer) return;

        const ctx = this.getContext();
        const source = ctx.createBufferSource();
        source.buffer = this.flipBuffer;

        // Add slight pitch variation for realism
        source.playbackRate.value = 0.9 + Math.random() * 0.2;

        const gain = ctx.createGain();
        gain.gain.value = this.volume;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
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
