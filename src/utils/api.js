const API_BASE_URL = import.meta.env.PROD
    ? '' // Use relative URLs in production 
    : 'http://localhost:3000'; // Vercel dev server
class ApiClient {
    constructor(baseUrl) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        const responseText = await response.text();
        console.log(`API Response: ${response.status} ${responseText}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${responseText}`);
        }
        try {
            return JSON.parse(responseText);
        }
        catch (parseError) {
            throw new Error(`Failed to parse JSON response: ${responseText}`);
        }
    }
    async get(endpoint) {
        return this.request(endpoint);
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // Tournament methods
    async getTournament(slug) {
        return this.get(`/api/tournament/${slug}`);
    }
    async getLeaderboard(slug) {
        return this.get(`/api/leaderboard/${slug}`);
    }
    async getTeams(tournamentId) {
        return this.get(`/api/teams/${tournamentId}`);
    }
    async getMatches(tournamentId) {
        return this.get(`/api/matches/${tournamentId}`);
    }
    async joinTeam(data) {
        return this.post('/api/team/join', data);
    }
    async toggleRegistration(slug, isOpen) {
        return this.post(`/api/tournament/${slug}/toggle-registration`, { isOpen });
    }
}
export const api = new ApiClient(API_BASE_URL);
