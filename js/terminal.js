// Terminal emulation
const terminal = {
    output: null,
    input: null,
    history: [],
    historyIndex: -1,
    isTyping: false,

    init() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');

        // Handle input
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Focus input on click anywhere in terminal
        document.querySelector('.terminal-body').addEventListener('click', () => {
            this.input.focus();
        });

        // Show welcome message
        this.showWelcome();
    },

    handleKeydown(e) {
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            if (cmd) {
                this.history.push(cmd);
                this.historyIndex = this.history.length;
                this.executeCommand(cmd);
            }
            this.input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocomplete();
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            this.clear();
        }
    },

    async executeCommand(cmd) {
        // Echo command
        this.print(`<span class="output-command">$ ${cmd}</span>`);

        const [command, ...args] = cmd.toLowerCase().split(/\s+/);

        switch (command) {
            case 'help':
                this.showHelp();
                break;
            case 'ls':
                await this.listProjects();
                break;
            case 'cat':
                await this.showProject(args[0]);
                break;
            case 'about':
                this.showAbout();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'clear':
                this.clear();
                break;
            case 'whoami':
                this.print('visitor');
                break;
            case 'pwd':
                this.print('/home/visitor/felixlynch.com');
                break;
            case 'date':
                this.print(new Date().toString());
                break;
            case 'echo':
                this.print(this.escapeHtml(args.join(' ')));
                break;
            case 'grep':
                await this.grepProjects(args[0]);
                break;
            case 'neofetch':
            case 'fastfetch':
                this.showNeofetch();
                break;
            case 'time':
                this.print(`<span class="output-info">${new Date().toLocaleTimeString()}</span>`);
                break;
            case 'fortune':
            case 'cowsay':
                this.showFortune();
                break;
            case 'matrix':
                this.showMatrix();
                break;
            case 'sudo':
                this.print('<span class="output-error">Nice try! 😏</span>');
                break;
            case 'rm':
                if (args.includes('-rf') || args.includes('-rf/')) {
                    this.print('<span class="output-error">I don\'t think so...</span>');
                } else {
                    this.print('<span class="output-error">Permission denied (this is a portfolio, not a real shell)</span>');
                }
                break;
            case 'vim':
            case 'nano':
            case 'emacs':
                this.print(`<span class="output-warning">${command}: command not found</span>`);
                this.print('<span class="output-info">I use Neovim btw</span>');
                break;
            case 'exit':
            case 'logout':
                this.print('Goodbye! 👋');
                this.print('<span class="output-info">Just kidding, you can\'t leave that easily.</span>');
                break;
            default:
                this.print(`<span class="output-error">command not found: ${this.escapeHtml(command)}</span>`);
                this.print('Type <span class="output-highlight">help</span> for available commands.');
        }

        this.scrollToBottom();
    },

    print(html) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.innerHTML = html;
        this.output.appendChild(line);
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    clear() {
        this.output.innerHTML = '';
    },

    scrollToBottom() {
        const terminalBody = document.getElementById('terminal-body');
        terminalBody.scrollTop = terminalBody.scrollHeight;
    },

    // Typing animation effect
    async typeText(text, speed = 30) {
        this.isTyping = true;
        const line = document.createElement('div');
        line.className = 'output-line';
        this.output.appendChild(line);

        for (let i = 0; i < text.length; i++) {
            line.textContent += text[i];
            this.scrollToBottom();
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        this.isTyping = false;
    },

    // Type multiple lines with animation
    async typeLines(lines, speed = 30, lineDelay = 100) {
        this.isTyping = true;

        for (const text of lines) {
            const line = document.createElement('div');
            line.className = 'output-line';
            this.output.appendChild(line);

            for (let i = 0; i < text.length; i++) {
                // Handle HTML tags - insert them instantly
                if (text[i] === '<') {
                    const tagEnd = text.indexOf('>', i);
                    if (tagEnd !== -1) {
                        line.innerHTML += text.substring(i, tagEnd + 1);
                        i = tagEnd;
                        continue;
                    }
                }
                line.innerHTML += text[i];
                this.scrollToBottom();
                await new Promise(resolve => setTimeout(resolve, speed));
            }

            await new Promise(resolve => setTimeout(resolve, lineDelay));
        }

        this.isTyping = false;
        this.scrollToBottom();
    },

    autocomplete() {
        const cmd = this.input.value.toLowerCase();
        const commands = ['help', 'ls', 'cat', 'grep', 'about', 'skills', 'contact', 'clear', 'whoami', 'pwd', 'date', 'echo', 'neofetch'];
        const match = commands.find(c => c.startsWith(cmd));
        if (match) {
            this.input.value = match;
        }
    },

    async showWelcome() {
        const ascii = `
<span class="ascii-art hornet">
                    ▲
                   ╱ ╲
                  ╱   ╲
                 ╱  ●  ╲
                ╱ ┌───┐ ╲
               ▕  │   │  ▏
                ╲ └───┘ ╱
                 ╲     ╱
                  ║   ║
             ━━━━━╬═══╬━━━━━━━━┓
                  ║   ║        ┃
                 ╱│   │╲       ┃
                ╱ │   │ ╲      ┃
               ╱  │   │  ╲     ┃
              ╱  ╱     ╲  ╲
             ╱  ╱       ╲  ╲
            ▕  ▕         ▏  ▏
</span>
<span class="output-highlight">
  ╔═══════════════════════════════════════╗
  ║   FELIX LYNCH  ·  Developer           ║
  ╚═══════════════════════════════════════╝
</span>`;

        // ASCII art appears instantly
        this.print(ascii);
        this.print('');

        // Welcome message types out
        await this.typeText('Welcome to my portfolio!', 25);
        this.print('');
        await this.typeText('Type "help" for available commands.', 25);
        this.print('');
    },

    showHelp() {
        this.print('');
        this.print('<span class="output-highlight">Available commands:</span>');
        this.print('');
        this.print('  <span class="output-success">ls</span>           List all projects');
        this.print('  <span class="output-success">cat</span> <name>   Show project details');
        this.print('  <span class="output-success">grep</span> <term>  Search projects');
        this.print('  <span class="output-success">about</span>        About me');
        this.print('  <span class="output-success">skills</span>       Languages & tools');
        this.print('  <span class="output-success">contact</span>      Contact information');
        this.print('  <span class="output-success">neofetch</span>     System info');
        this.print('  <span class="output-success">fortune</span>      Random dev wisdom');
        this.print('  <span class="output-success">clear</span>        Clear terminal (or Ctrl+L)');
        this.print('  <span class="output-success">help</span>         Show this help');
        this.print('');
        this.print('<span class="output-info">Tip: Use Tab for autocomplete, ↑↓ for history</span>');
        this.print('<span class="output-info">Easter eggs: try matrix, sudo, vim, exit...</span>');
        this.print('');
    },

    async listProjects() {
        this.print('');
        this.print('Fetching projects from GitHub...');

        const repos = await fetchRepos();

        if (!repos) {
            this.print('<span class="output-error">Failed to fetch projects. Try again later.</span>');
            return;
        }

        this.print('');
        this.print(`<span class="output-highlight">Projects (${repos.length})</span>`);
        this.print('');

        for (const repo of repos) {
            const r = formatRepo(repo);
            const featured = FEATURED_REPOS.includes(r.name) ? ' <span class="output-warning">★ featured</span>' : '';
            const stars = r.stars > 0 ? ` ⭐${r.stars}` : '';

            this.print(`  <span class="output-success">${r.name}</span>${featured}${stars}`);
            this.print(`  <span class="output-info">${r.language}</span> · ${r.description.substring(0, 60)}${r.description.length > 60 ? '...' : ''}`);
            this.print('');
        }

        this.print('<span class="output-info">Use</span> cat <name> <span class="output-info">for details</span>');
        this.print('');
    },

    async grepProjects(term) {
        if (!term) {
            this.print('<span class="output-error">Usage: grep <search-term></span>');
            return;
        }

        this.print('');
        this.print(`Searching for "<span class="output-highlight">${this.escapeHtml(term)}</span>"...`);

        const repos = await fetchRepos();

        if (!repos) {
            this.print('<span class="output-error">Failed to fetch project data.</span>');
            return;
        }

        const termLower = term.toLowerCase();
        const matches = repos.filter(repo => {
            const r = formatRepo(repo);
            return r.name.toLowerCase().includes(termLower) ||
                   r.description.toLowerCase().includes(termLower) ||
                   r.language.toLowerCase().includes(termLower);
        });

        if (matches.length === 0) {
            this.print(`<span class="output-warning">No matches found for "${this.escapeHtml(term)}"</span>`);
            return;
        }

        this.print(`<span class="output-success">Found ${matches.length} match${matches.length > 1 ? 'es' : ''}:</span>`);
        this.print('');

        for (const repo of matches) {
            const r = formatRepo(repo);
            // Highlight the search term in results
            const highlightTerm = (text) => {
                const regex = new RegExp(`(${term})`, 'gi');
                return text.replace(regex, '<span class="output-warning">$1</span>');
            };

            this.print(`  <span class="output-success">${highlightTerm(r.name)}</span>`);
            this.print(`  <span class="output-info">${r.language}</span> · ${highlightTerm(r.description.substring(0, 60))}${r.description.length > 60 ? '...' : ''}`);
            this.print('');
        }
    },

    async showProject(name) {
        if (!name) {
            this.print('<span class="output-error">Usage: cat <project-name></span>');
            return;
        }

        this.print('');
        const repos = await fetchRepos();

        if (!repos) {
            this.print('<span class="output-error">Failed to fetch project data.</span>');
            return;
        }

        const repo = repos.find(r => r.name.toLowerCase() === name.toLowerCase());

        if (!repo) {
            this.print(`<span class="output-error">Project not found: ${name}</span>`);
            this.print('Use <span class="output-highlight">ls</span> to see available projects.');
            return;
        }

        const r = formatRepo(repo);

        this.print(`<span class="output-highlight">═══ ${r.name} ═══</span>`);
        this.print('');
        this.print(`<span class="output-info">Description:</span> ${r.description}`);
        this.print(`<span class="output-info">Language:</span>    ${r.language}`);
        this.print(`<span class="output-info">Stars:</span>       ${r.stars}`);
        this.print(`<span class="output-info">Updated:</span>     ${r.updated}`);
        this.print('');
        this.print(`<span class="output-info">GitHub:</span>      <a href="${r.url}" target="_blank">${r.url}</a>`);
        if (r.homepage) {
            this.print(`<span class="output-info">Website:</span>     <a href="${r.homepage}" target="_blank">${r.homepage}</a>`);
        }
        this.print('');
    },

    showAbout() {
        this.print('');
        this.print('<span class="output-highlight">═══ About Me ═══</span>');
        this.print('');
        this.print("Hi! I'm Felix Lynch, a developer and student.");
        this.print('');
        this.print('<span class="output-info">Interests:</span>');
        this.print('  · Rust & systems programming');
        this.print('  · Terminal UIs & CLI tools');
        this.print('  · Linux ricing (Hyprland + Hollow Knight theme)');
        this.print('  · Productivity tools & automation');
        this.print('');
        this.print('<span class="output-info">Current project:</span> Focus - a TUI productivity app');
        this.print('');
    },

    showContact() {
        this.print('');
        this.print('<span class="output-highlight">═══ Contact ═══</span>');
        this.print('');
        this.print('<span class="output-info">GitHub:</span>   <a href="https://github.com/felixlynch10" target="_blank">github.com/felixlynch10</a>');
        this.print('<span class="output-info">Email:</span>    <a href="mailto:felixlynch10@gmail.com">felixlynch10@gmail.com</a>');
        this.print('<span class="output-info">Website:</span>  <a href="https://felixlynch.com">felixlynch.com</a>');
        this.print('');
    },

    showSkills() {
        const skillBar = (level) => {
            const filled = '█'.repeat(level);
            const empty = '░'.repeat(5 - level);
            return `<span class="output-success">${filled}</span><span class="output-dim">${empty}</span>`;
        };

        this.print('');
        this.print('<span class="output-highlight">═══ Skills ═══</span>');
        this.print('');
        this.print('<span class="output-info">Languages</span>');
        this.print(`  Rust          ${skillBar(4)} Systems programming, CLI tools`);
        this.print(`  JavaScript    ${skillBar(4)} Web dev, Node.js`);
        this.print(`  Python        ${skillBar(3)} Scripting, automation`);
        this.print(`  HTML/CSS      ${skillBar(4)} Responsive design`);
        this.print(`  Bash          ${skillBar(3)} Shell scripting`);
        this.print(`  Lua           ${skillBar(2)} Neovim config`);
        this.print('');
        this.print('<span class="output-info">Tools & Technologies</span>');
        this.print(`  Git           ${skillBar(4)} Version control`);
        this.print(`  Linux         ${skillBar(4)} Daily driver, Hyprland`);
        this.print(`  Neovim        ${skillBar(4)} Primary editor`);
        this.print(`  Docker        ${skillBar(2)} Containers`);
        this.print('');
        this.print('<span class="output-info">Interests</span>');
        this.print('  · Terminal UIs & CLI tools');
        this.print('  · Systems programming');
        this.print('  · Linux ricing');
        this.print('  · Productivity automation');
        this.print('');
    },

    showNeofetch() {
        this.print('');
        this.print('<span class="ascii-art">       _,met$$$$$gg.</span>           <span class="output-highlight">visitor@felixlynch.com</span>');
        this.print('<span class="ascii-art">    ,g$$$$$$$$$$$$$$$P.</span>        ──────────────────────');
        this.print('<span class="ascii-art">  ,g$$P"     """Y$$.". </span>        <span class="output-info">OS:</span> Browser');
        this.print('<span class="ascii-art"> ,$$P\'              `$$$.</span>      <span class="output-info">Host:</span> felixlynch.com');
        this.print('<span class="ascii-art">\',$$P       ,ggs.     `$$b:</span>    <span class="output-info">Shell:</span> portfolio-terminal');
        this.print('<span class="ascii-art">`d$$\'     ,$P"\'   .    $$$</span>     <span class="output-info">Theme:</span> Hollow Knight');
        this.print('<span class="ascii-art"> $$P      d$\'     ,    $$P</span>     <span class="output-info">Icons:</span> JetBrains Mono');
        this.print('<span class="ascii-art"> $$:      $$.   -    ,d$$\'</span>     <span class="output-info">Terminal:</span> CSS + JS');
        this.print('<span class="ascii-art"> $$;      Y$b._   _,d$P\'</span>');
        this.print('<span class="ascii-art"> Y$$.    `.`"Y$$$$P"\'</span>');
        this.print('<span class="ascii-art"> `$$b      "-.__</span>');
        this.print('<span class="ascii-art">  `Y$$</span>');
        this.print('<span class="ascii-art">   `Y$$.</span>');
        this.print('<span class="ascii-art">     `$$b.</span>');
        this.print('<span class="ascii-art">       `Y$$b.</span>');
        this.print('<span class="ascii-art">          `"Y$b._</span>');
        this.print('<span class="ascii-art">              `"""</span>');
        this.print('');
    },

    showFortune() {
        const fortunes = [
            "You will face many merge conflicts in your future.",
            "A bug is just an undocumented feature.",
            "The best code is no code at all.",
            "git push --force is never the answer. Except when it is.",
            "There are only two hard things in CS: cache invalidation and naming things.",
            "It works on my machine ¯\\_(ツ)_/¯",
            "sudo rm -rf / will solve all your problems. Don't actually do this.",
            "The code you write today is tomorrow's legacy code.",
            "Comments lie. Code doesn't.",
            "First, solve the problem. Then, write the code.",
            "Weeks of coding can save hours of planning.",
            "A user interface is like a joke. If you have to explain it, it's not that good."
        ];
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        this.print('');
        this.print(`<span class="output-success">🔮 ${fortune}</span>`);
        this.print('');
    },

    showMatrix() {
        this.print('');
        this.print('<span class="output-success">Wake up, Neo...</span>');
        this.print('<span class="output-success">The Matrix has you...</span>');
        this.print('<span class="output-success">Follow the white rabbit.</span>');
        this.print('');
        this.print('<span class="output-info">Knock, knock, Neo.</span>');
        this.print('');
    }
};
