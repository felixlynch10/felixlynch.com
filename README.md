# felixlynch.com

Terminal-style portfolio site showcasing my GitHub projects.

## Features

- **Interactive terminal UI** - Type commands like a real shell
- **GitHub integration** - Auto-fetches projects from GitHub API
- **Hollow Knight theme** - Dark void background with soul cyan accents
- **Responsive** - Works on mobile and desktop
- **Offline-friendly** - LocalStorage caching for repos

## Commands

| Command | Description |
|---------|-------------|
| `ls` | List all projects |
| `cat <name>` | Show project details |
| `about` | About me |
| `contact` | Contact information |
| `neofetch` | System info display |
| `fortune` | Random dev wisdom |
| `help` | Show all commands |
| `clear` | Clear terminal (or Ctrl+L) |

### Easter Eggs

Try `matrix`, `sudo`, `vim`, `exit`, `rm -rf` for surprises!

## Tech Stack

- **HTML/CSS/JS** - No frameworks, no build step
- **GitHub REST API** - Fetches repo data dynamically
- **JetBrains Mono** - Monospace font from Google Fonts
- **LocalStorage** - 10-minute cache for API responses

## Development

```bash
# Clone
git clone https://github.com/felixlynch10/felixlynch.com.git
cd felixlynch.com

# Serve locally
python3 -m http.server 8000

# Visit http://localhost:8000
```

## Deploy

Static files - deploy anywhere:
- GitHub Pages
- Netlify
- Vercel
- Any static host

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Void Black | `#0a0a0f` | Background |
| Void Dark | `#1a1a24` | Terminal bg |
| Soul Cyan | `#a0d0d8` | Accents, prompt |
| Pale White | `#e8e8e4` | Text |
| Hornet Red | `#9A2734` | Errors |
| Radiance Orange | `#f08030` | Warnings |

## License

MIT
