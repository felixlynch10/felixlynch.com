// Soul particle effect (Hollow Knight inspired)
const particles = {
    canvas: null,
    ctx: null,
    particles: [],
    count: 30,

    init() {
        this.canvas = document.getElementById('particles');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Create particles
        for (let i = 0; i < this.count; i++) {
            this.particles.push(this.createParticle());
        }

        // Handle resize
        window.addEventListener('resize', () => this.resize());

        // Start animation
        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticle() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -Math.random() * 0.5 - 0.1, // Float upward
            opacity: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2, // Phase offset for pulsing
        };
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let p of this.particles) {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += 0.02;

            // Wrap around edges
            if (p.y < -10) {
                p.y = this.canvas.height + 10;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;

            // Calculate pulsing opacity
            const pulseOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

            // Draw particle with glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            // Soul cyan color with glow
            const gradient = this.ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size * 3
            );
            gradient.addColorStop(0, `rgba(160, 208, 216, ${pulseOpacity})`);
            gradient.addColorStop(0.5, `rgba(160, 208, 216, ${pulseOpacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(160, 208, 216, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(232, 232, 228, ${pulseOpacity})`;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => particles.init());
