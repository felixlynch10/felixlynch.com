// Terminal emulation
const terminal = {
    output: null,
    input: null,
    history: [],
    historyIndex: -1,
    isTyping: false,
    startTime: Date.now(),
    konamiCode: [],
    konamiSequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],

    init() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.startTime = Date.now();

        // Konami code listener
        document.addEventListener('keydown', (e) => this.checkKonami(e));

        // Handle input
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Focus input on click anywhere in terminal
        document.querySelector('.terminal-body').addEventListener('click', (e) => {
            // Handle click-to-copy
            if (e.target.classList.contains('copyable')) {
                e.preventDefault();
                const text = e.target.dataset.copy;
                navigator.clipboard.writeText(text);
                const hint = e.target.nextElementSibling;
                if (hint && hint.classList.contains('copy-hint')) {
                    hint.innerHTML = '<span class="output-warning">✓ copied!</span>';
                    setTimeout(() => {
                        hint.innerHTML = '(click to copy)';
                    }, 2000);
                }
                return;
            }
            this.input.focus();
        });

        // Show welcome message
        this.showWelcome();
    },

    async handleKeydown(e) {
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
            await this.autocomplete();
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
                if (args.includes('--verbose') || args.includes('-v')) {
                    this.showWhoamiVerbose();
                } else {
                    this.print('visitor');
                }
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
            case 'open':
                await this.openProject(args[0]);
                break;
            case 'clone':
                await this.cloneProject(args[0]);
                break;
            case 'stats':
                await this.showStats();
                break;
            case 'social':
                this.showSocial();
                break;
            case 'history':
                this.showHistory();
                break;
            case 'man':
                this.showMan(args[0]);
                break;
            case 'latest':
                await this.showLatest();
                break;
            case 'uptime':
                this.showUptime();
                break;
            case 'neofetch':
            case 'fastfetch':
                this.showNeofetch();
                break;
            case 'time':
                this.showTime(args);
                break;
            case 'visitors':
                this.showVisitors();
                break;
            case 'figlet':
                this.showFiglet(args.join(' '));
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

    // GitHub-style language colors
    getLangColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'Rust': '#dea584',
            'Go': '#00ADD8',
            'Java': '#b07219',
            'C': '#555555',
            'C++': '#f34b7d',
            'C#': '#178600',
            'Ruby': '#701516',
            'PHP': '#4F5D95',
            'Swift': '#F05138',
            'Kotlin': '#A97BFF',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Shell': '#89e051',
            'Lua': '#000080',
            'Vim Script': '#199f4b',
            'Unknown': '#8a8a9a'
        };
        return colors[lang] || colors['Unknown'];
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

    async autocomplete() {
        const input = this.input.value;
        const parts = input.split(/\s+/);
        const commands = ['help', 'ls', 'cat', 'grep', 'open', 'clone', 'stats', 'latest', 'about', 'skills', 'social', 'contact', 'history', 'man', 'uptime', 'time', 'visitors', 'figlet', 'clear', 'whoami', 'pwd', 'date', 'echo', 'neofetch', 'fortune', 'matrix'];

        // If just typing a command (no space yet)
        if (parts.length === 1) {
            const match = commands.find(c => c.startsWith(input.toLowerCase()));
            if (match) {
                this.input.value = match;
            }
            return;
        }

        // If typing argument for project-related commands
        const projectCommands = ['cat', 'open', 'clone'];
        const cmd = parts[0].toLowerCase();

        if (projectCommands.includes(cmd)) {
            const partial = parts[1]?.toLowerCase() || '';
            const repos = await fetchRepos();

            if (repos) {
                const matches = repos
                    .map(r => r.name)
                    .filter(name => name.toLowerCase().startsWith(partial));

                if (matches.length === 1) {
                    // Single match - complete it
                    this.input.value = `${cmd} ${matches[0]}`;
                } else if (matches.length > 1 && partial) {
                    // Multiple matches - show them
                    this.print(`<span class="output-command">$ ${input}</span>`);
                    this.print(`<span class="output-dim">${matches.join('  ')}</span>`);
                }
            }
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
        this.print('  <span class="output-success">open</span> <name>  Open project on GitHub');
        this.print('  <span class="output-success">clone</span> <name> Get git clone command');
        this.print('  <span class="output-success">stats</span>        GitHub statistics');
        this.print('  <span class="output-success">about</span>        About me');
        this.print('  <span class="output-success">skills</span>       Languages & tools');
        this.print('  <span class="output-success">social</span>       Social links');
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

        // Create loading line
        const loadingLine = document.createElement('div');
        loadingLine.className = 'output-line';
        loadingLine.innerHTML = '<span class="output-dim">Fetching projects </span><span class="spinner">⠋</span>';
        this.output.appendChild(loadingLine);

        const spinner = loadingLine.querySelector('.spinner');
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let frameIdx = 0;
        const spinnerInterval = setInterval(() => {
            frameIdx = (frameIdx + 1) % frames.length;
            spinner.textContent = frames[frameIdx];
        }, 80);

        const repos = await fetchRepos();

        clearInterval(spinnerInterval);
        loadingLine.remove();

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
            const langColor = this.getLangColor(r.language);

            this.print(`  <span class="output-success">${r.name}</span>${featured}${stars}`);
            this.print(`  <span style="color:${langColor}">●</span> <span class="output-info">${r.language}</span> · ${r.description.substring(0, 60)}${r.description.length > 60 ? '...' : ''}`);
            this.print('');
        }

        this.print('<span class="output-info">Use</span> cat <name> <span class="output-info">for details</span>');
        this.print('');
    },

    async openProject(name) {
        if (!name) {
            this.print('<span class="output-error">Usage: open <project-name></span>');
            return;
        }

        const repos = await fetchRepos();
        if (!repos) {
            this.print('<span class="output-error">Failed to fetch project data.</span>');
            return;
        }

        const repo = repos.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (!repo) {
            this.print(`<span class="output-error">Project not found: ${this.escapeHtml(name)}</span>`);
            return;
        }

        this.print(`<span class="output-success">Opening ${repo.name} on GitHub...</span>`);
        window.open(repo.html_url, '_blank');
    },

    async cloneProject(name) {
        if (!name) {
            this.print('<span class="output-error">Usage: clone <project-name></span>');
            return;
        }

        const repos = await fetchRepos();
        if (!repos) {
            this.print('<span class="output-error">Failed to fetch project data.</span>');
            return;
        }

        const repo = repos.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (!repo) {
            this.print(`<span class="output-error">Project not found: ${this.escapeHtml(name)}</span>`);
            return;
        }

        const cloneUrl = repo.clone_url;
        const sshUrl = `git@github.com:${GITHUB_USERNAME}/${repo.name}.git`;

        this.print('');
        this.print(`<span class="output-highlight">═══ Clone ${repo.name} ═══</span>`);
        this.print('');
        this.print('<span class="output-info">HTTPS:</span>');
        this.print(`  <span class="output-success clickable" data-copy="${cloneUrl}">git clone ${cloneUrl}</span>`);
        this.print('');
        this.print('<span class="output-info">SSH:</span>');
        this.print(`  <span class="output-success clickable" data-copy="git clone ${sshUrl}">git clone ${sshUrl}</span>`);
        this.print('');
        this.print('<span class="output-dim">Click to copy</span>');
        this.print('');

        // Add click handlers for copy
        setTimeout(() => {
            document.querySelectorAll('.clickable[data-copy]').forEach(el => {
                el.style.cursor = 'pointer';
                el.onclick = () => {
                    navigator.clipboard.writeText(el.dataset.copy);
                    el.innerHTML += ' <span class="output-warning">✓ copied!</span>';
                };
            });
        }, 0);
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
        this.print(`<span class="output-info">GitHub:</span>      <a href="${r.url}" target="_blank" class="copyable" data-copy="${r.url}">${r.url}</a> <span class="output-dim copy-hint">(click to copy)</span>`);
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

    showSocial() {
        this.print('');
        this.print('<span class="output-highlight">═══ Social ═══</span>');
        this.print('');
        this.print('<span class="output-info">GitHub:</span>    <a href="https://github.com/felixlynch10" target="_blank">github.com/felixlynch10</a>');
        this.print('<span class="output-info">Email:</span>     <a href="mailto:felixlynch10@gmail.com">felixlynch10@gmail.com</a>');
        this.print('<span class="output-info">Website:</span>   <a href="https://felixlynch.com" target="_blank">felixlynch.com</a>');
        this.print('');
        this.print('<span class="output-dim">More links coming soon...</span>');
        this.print('');
    },

    showHistory() {
        this.print('');
        if (this.history.length === 0) {
            this.print('<span class="output-dim">No commands in history yet.</span>');
            return;
        }
        this.print('<span class="output-highlight">Command History</span>');
        this.print('');
        this.history.forEach((cmd, i) => {
            this.print(`  <span class="output-dim">${String(i + 1).padStart(3)}</span>  ${cmd}`);
        });
        this.print('');
    },

    showMan(cmd) {
        const manPages = {
            ls: {
                name: 'ls - list projects',
                synopsis: 'ls',
                description: 'Lists all GitHub repositories with their descriptions, languages, and star counts. Featured projects are shown first.'
            },
            cat: {
                name: 'cat - show project details',
                synopsis: 'cat <project-name>',
                description: 'Displays detailed information about a project including description, language, stars, last update, and links.'
            },
            grep: {
                name: 'grep - search projects',
                synopsis: 'grep <search-term>',
                description: 'Searches project names, descriptions, and languages for the given term. Matches are highlighted in the results.'
            },
            open: {
                name: 'open - open project on GitHub',
                synopsis: 'open <project-name>',
                description: 'Opens the project\'s GitHub page in a new browser tab.'
            },
            clone: {
                name: 'clone - get clone command',
                synopsis: 'clone <project-name>',
                description: 'Shows git clone commands (HTTPS and SSH) for the project. Click to copy to clipboard.'
            },
            stats: {
                name: 'stats - GitHub statistics',
                synopsis: 'stats',
                description: 'Shows aggregate statistics: total repositories, total stars, and language breakdown with visual bars.'
            },
            skills: {
                name: 'skills - languages and tools',
                synopsis: 'skills',
                description: 'Displays programming languages and tools with proficiency levels shown as visual bars.'
            }
        };

        if (!cmd) {
            this.print('<span class="output-error">Usage: man <command></span>');
            this.print('<span class="output-dim">Available: ' + Object.keys(manPages).join(', ') + '</span>');
            return;
        }

        const page = manPages[cmd.toLowerCase()];
        if (!page) {
            this.print(`<span class="output-error">No manual entry for ${this.escapeHtml(cmd)}</span>`);
            return;
        }

        this.print('');
        this.print(`<span class="output-highlight">NAME</span>`);
        this.print(`       ${page.name}`);
        this.print('');
        this.print(`<span class="output-highlight">SYNOPSIS</span>`);
        this.print(`       <span class="output-success">${page.synopsis}</span>`);
        this.print('');
        this.print(`<span class="output-highlight">DESCRIPTION</span>`);
        this.print(`       ${page.description}`);
        this.print('');
    },

    async showLatest() {
        const repos = await fetchRepos();
        if (!repos || repos.length === 0) {
            this.print('<span class="output-error">Failed to fetch projects.</span>');
            return;
        }

        // Sort by update date (most recent first)
        const sorted = [...repos].sort((a, b) =>
            new Date(b.updated_at) - new Date(a.updated_at)
        );
        const latest = sorted[0];
        const r = formatRepo(latest);

        this.print('');
        this.print('<span class="output-highlight">Most Recently Updated</span>');
        this.print('');
        this.print(`  <span class="output-success">${r.name}</span>`);
        this.print(`  <span class="output-info">${r.language}</span> · ${r.description}`);
        this.print(`  Updated: ${r.updated}`);
        this.print('');
    },

    async showStats() {
        this.print('');
        this.print('Crunching numbers...');

        const repos = await fetchRepos();
        if (!repos) {
            this.print('<span class="output-error">Failed to fetch stats.</span>');
            return;
        }

        // Calculate stats
        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        const languages = {};
        repos.forEach(r => {
            if (r.language) {
                languages[r.language] = (languages[r.language] || 0) + 1;
            }
        });

        // Sort languages by count
        const sortedLangs = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        this.print('');
        this.print('<span class="output-highlight">═══ GitHub Stats ═══</span>');
        this.print('');
        this.print(`<span class="output-info">Total Repos:</span>  ${repos.length}`);
        this.print(`<span class="output-info">Total Stars:</span>  ${totalStars} ⭐`);
        this.print('');
        this.print('<span class="output-info">Languages:</span>');

        const maxCount = sortedLangs[0]?.[1] || 1;
        for (const [lang, count] of sortedLangs) {
            const barLen = Math.round((count / maxCount) * 10);
            const bar = '█'.repeat(barLen) + '░'.repeat(10 - barLen);
            this.print(`  ${lang.padEnd(12)} <span class="output-success">${bar}</span> ${count}`);
        }
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

        // Calculate padding for speech bubble
        const padding = Math.max(0, 40 - fortune.length);
        const topLine = ' ' + '_'.repeat(Math.min(fortune.length + 2, 42));
        const bottomLine = ' ' + '-'.repeat(Math.min(fortune.length + 2, 42));

        this.print('');
        this.print(`<span class="ascii-art">${topLine}</span>`);
        this.print(`<span class="ascii-art">< ${fortune} ></span>`);
        this.print(`<span class="ascii-art">${bottomLine}</span>`);
        this.print('<span class="ascii-art">        \\   ^__^</span>');
        this.print('<span class="ascii-art">         \\  (oo)\\_______</span>');
        this.print('<span class="ascii-art">            (__)\\       )\\/\\</span>');
        this.print('<span class="ascii-art">                ||----w |</span>');
        this.print('<span class="ascii-art">                ||     ||</span>');
        this.print('');
    },

    showUptime() {
        const now = Date.now();
        const diff = now - this.startTime;

        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / (1000 * 60)) % 60;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        let uptime = '';
        if (hours > 0) uptime += `${hours}h `;
        if (minutes > 0 || hours > 0) uptime += `${minutes}m `;
        uptime += `${seconds}s`;

        this.print('');
        this.print(`<span class="output-info">Session uptime:</span> <span class="output-success">${uptime}</span>`);
        this.print(`<span class="output-dim">Started: ${new Date(this.startTime).toLocaleTimeString()}</span>`);
        this.print('');
    },

    showWhoamiVerbose() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        const lang = navigator.language;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const screenW = screen.width;
        const screenH = screen.height;

        // Try to parse browser
        let browser = 'Unknown';
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';

        // Try to parse OS
        let os = platform;
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS')) os = 'iOS';

        this.print('');
        this.print('<span class="output-highlight">═══ Visitor Info ═══</span>');
        this.print('');
        this.print(`<span class="output-info">User:</span>      visitor`);
        this.print(`<span class="output-info">Browser:</span>   ${browser}`);
        this.print(`<span class="output-info">OS:</span>        ${os}`);
        this.print(`<span class="output-info">Language:</span>  ${lang}`);
        this.print(`<span class="output-info">Viewport:</span>  ${width}x${height}`);
        this.print(`<span class="output-info">Screen:</span>    ${screenW}x${screenH}`);
        this.print('');
    },

    showTime(args) {
        const now = new Date();
        this.print('');

        if (args.length === 0) {
            this.print(`<span class="output-info">Local:</span> ${now.toLocaleString()}`);
        } else {
            // Show multiple timezones
            const timezones = {
                'utc': 'UTC',
                'pst': 'America/Los_Angeles',
                'est': 'America/New_York',
                'gmt': 'Europe/London',
                'jst': 'Asia/Tokyo',
                'cet': 'Europe/Paris'
            };

            this.print('<span class="output-highlight">World Clock</span>');
            this.print('');

            for (const [key, tz] of Object.entries(timezones)) {
                try {
                    const time = now.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true });
                    this.print(`  <span class="output-info">${key.toUpperCase().padEnd(4)}</span> ${time}`);
                } catch (e) {
                    // Skip invalid timezone
                }
            }
        }
        this.print('');
        this.print('<span class="output-dim">Tip: use "time all" for world clock</span>');
        this.print('');
    },

    showVisitors() {
        // Fun fake visitor counter using localStorage
        let count = parseInt(localStorage.getItem('visitor_count') || '0');
        if (count === 0) {
            count = Math.floor(Math.random() * 900) + 100; // Start with random 100-999
        }
        count++;
        localStorage.setItem('visitor_count', count.toString());

        this.print('');
        this.print('<span class="output-highlight">═══ Visitor Stats ═══</span>');
        this.print('');
        this.print(`<span class="output-info">You are visitor #</span><span class="output-success">${count}</span>`);
        this.print(`<span class="output-dim">(not really, this is just localStorage)</span>`);
        this.print('');
    },

    showFiglet(text) {
        if (!text) {
            this.print('<span class="output-error">Usage: figlet <text></span>');
            return;
        }

        // Simple 3-line block font
        const font = {
            'A': ['█▀█', '█▀█', '▀ ▀'],
            'B': ['█▀▄', '█▀▄', '▀▀ '],
            'C': ['█▀▀', '█  ', '▀▀▀'],
            'D': ['█▀▄', '█ █', '▀▀ '],
            'E': ['█▀▀', '█▀▀', '▀▀▀'],
            'F': ['█▀▀', '█▀▀', '▀  '],
            'G': ['█▀▀', '█ █', '▀▀▀'],
            'H': ['█ █', '█▀█', '▀ ▀'],
            'I': ['▀█▀', ' █ ', '▀▀▀'],
            'J': ['  █', '  █', '▀▀ '],
            'K': ['█ █', '█▀▄', '▀ ▀'],
            'L': ['█  ', '█  ', '▀▀▀'],
            'M': ['█▄█', '█ █', '▀ ▀'],
            'N': ['█▀█', '█ █', '▀ ▀'],
            'O': ['█▀█', '█ █', '▀▀▀'],
            'P': ['█▀█', '█▀▀', '▀  '],
            'Q': ['█▀█', '█ █', '▀▀█'],
            'R': ['█▀█', '█▀▄', '▀ ▀'],
            'S': ['█▀▀', '▀▀█', '▀▀▀'],
            'T': ['▀█▀', ' █ ', ' ▀ '],
            'U': ['█ █', '█ █', '▀▀▀'],
            'V': ['█ █', '█ █', ' ▀ '],
            'W': ['█ █', '█ █', '▀▄▀'],
            'X': ['█ █', ' ▀ ', '█ █'],
            'Y': ['█ █', ' █ ', ' ▀ '],
            'Z': ['▀▀█', ' █ ', '█▀▀'],
            ' ': ['   ', '   ', '   '],
            '!': [' █ ', ' █ ', ' ▀ '],
            '?': ['▀▀█', ' █ ', ' ▀ '],
            '.': ['   ', '   ', ' ▀ '],
            '0': ['█▀█', '█ █', '▀▀▀'],
            '1': [' █ ', ' █ ', ' ▀ '],
            '2': ['▀▀█', '█▀▀', '▀▀▀'],
            '3': ['▀▀█', ' ▀█', '▀▀▀'],
            '4': ['█ █', '▀▀█', '  ▀'],
            '5': ['█▀▀', '▀▀█', '▀▀▀'],
            '6': ['█▀▀', '█▀█', '▀▀▀'],
            '7': ['▀▀█', '  █', '  ▀'],
            '8': ['█▀█', '█▀█', '▀▀▀'],
            '9': ['█▀█', '▀▀█', '▀▀▀']
        };

        const lines = ['', '', ''];
        const chars = text.toUpperCase().slice(0, 12); // Limit to 12 chars

        for (const char of chars) {
            const glyph = font[char] || font['?'];
            lines[0] += glyph[0] + ' ';
            lines[1] += glyph[1] + ' ';
            lines[2] += glyph[2] + ' ';
        }

        this.print('');
        this.print(`<span class="ascii-art">${lines[0]}</span>`);
        this.print(`<span class="ascii-art">${lines[1]}</span>`);
        this.print(`<span class="ascii-art">${lines[2]}</span>`);
        this.print('');
    },

    checkKonami(e) {
        // Don't track if input is focused
        if (document.activeElement === this.input) return;

        this.konamiCode.push(e.key);

        // Keep only last 10 keys
        if (this.konamiCode.length > 10) {
            this.konamiCode.shift();
        }

        // Check if matches
        if (this.konamiCode.length === 10 &&
            this.konamiCode.every((key, i) => key === this.konamiSequence[i])) {
            this.triggerKonami();
            this.konamiCode = [];
        }
    },

    triggerKonami() {
        this.print('');
        this.print('<span class="output-warning">🎮 KONAMI CODE ACTIVATED! 🎮</span>');
        this.print('');
        this.print('<span class="ascii-art hornet">');
        this.print('  ⬆️ ⬆️ ⬇️ ⬇️ ⬅️ ➡️ ⬅️ ➡️ 🅱️ 🅰️');
        this.print('</span>');
        this.print('');
        this.print('<span class="output-success">+30 lives! (not really, this is a website)</span>');
        this.print('<span class="output-info">You found a secret! 🎉</span>');
        this.print('');
        this.scrollToBottom();
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
