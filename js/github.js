// GitHub API integration
const GITHUB_USERNAME = 'felixlynch10';
const GITHUB_API = 'https://api.github.com';

// Cache settings
const CACHE_KEY = 'github_repos_cache';
const CACHE_TIME_KEY = 'github_repos_time';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Memory cache
let reposCache = null;

// Featured projects (shown first)
const FEATURED_REPOS = ['focus', 'felixlynch.com'];

// Load cache from localStorage on init
function loadCacheFromStorage() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

        if (cached && cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < CACHE_DURATION) {
                reposCache = JSON.parse(cached);
                return true;
            }
        }
    } catch (e) {
        console.log('Cache load failed:', e);
    }
    return false;
}

// Save cache to localStorage
function saveCacheToStorage(repos) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(repos));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
        console.log('Cache save failed:', e);
    }
}

async function fetchRepos() {
    // Check memory cache first
    if (reposCache) {
        return reposCache;
    }

    // Try localStorage cache
    if (loadCacheFromStorage()) {
        return reposCache;
    }

    try {
        const response = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();

        // Filter out forks, sort by stars then by update date
        reposCache = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => {
                // Featured repos first
                const aFeatured = FEATURED_REPOS.includes(a.name);
                const bFeatured = FEATURED_REPOS.includes(b.name);
                if (aFeatured && !bFeatured) return -1;
                if (!aFeatured && bFeatured) return 1;

                // Then by stars
                if (b.stargazers_count !== a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }

                // Then by update date
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

        // Save to localStorage
        saveCacheToStorage(reposCache);
        return reposCache;

    } catch (error) {
        console.error('Failed to fetch repos:', error);
        return null;
    }
}

async function fetchRepo(name) {
    try {
        const response = await fetch(`${GITHUB_API}/repos/${GITHUB_USERNAME}/${name}`);

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch repo ${name}:`, error);
        return null;
    }
}

function formatRepo(repo) {
    const lang = repo.language || 'Unknown';
    const stars = repo.stargazers_count;
    const desc = repo.description || 'No description';

    return {
        name: repo.name,
        description: desc,
        language: lang,
        stars: stars,
        url: repo.html_url,
        homepage: repo.homepage,
        updated: new Date(repo.updated_at).toLocaleDateString()
    };
}
