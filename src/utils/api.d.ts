declare class ApiClient {
    private baseUrl;
    constructor(baseUrl: string);
    private request;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: any): Promise<T>;
    getTournament(slug: string): Promise<unknown>;
    getLeaderboard(slug: string): Promise<unknown>;
    getTeams(tournamentId: string): Promise<unknown>;
    getMatches(tournamentId: string): Promise<unknown>;
    joinTeam(data: {
        slug: string;
        teamName: string;
        colorHex: string;
        flagCode: string;
        userId: string;
        userName: string;
    }): Promise<unknown>;
    toggleRegistration(slug: string, isOpen: boolean): Promise<unknown>;
}
export declare const api: ApiClient;
export {};
