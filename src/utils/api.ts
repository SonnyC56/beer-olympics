const API_BASE_URL = import.meta.env.PROD 
  ? '' // Use relative URLs in production 
  : 'http://localhost:3000'; // Vercel dev server

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tournament methods
  async getTournament(slug: string) {
    return this.get(`/api/tournament/${slug}`);
  }

  async getLeaderboard(slug: string) {
    return this.get(`/api/leaderboard/${slug}`);
  }

  async getTeams(tournamentId: string) {
    return this.get(`/api/teams/${tournamentId}`);
  }

  async getMatches(tournamentId: string) {
    return this.get(`/api/matches/${tournamentId}`);
  }

  async joinTeam(data: {
    slug: string;
    teamName: string;
    colorHex: string;
    flagCode: string;
    userId: string;
    userName: string;
  }) {
    return this.post('/api/team/join', data);
  }

  async toggleRegistration(slug: string, isOpen: boolean) {
    return this.post(`/api/tournament/${slug}/toggle-registration`, { isOpen });
  }
}

export const api = new ApiClient(API_BASE_URL);