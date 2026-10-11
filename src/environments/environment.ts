export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080',
  devLogin: null as { loginId: string; password: string; role: 'admin' | 'store_manager'; assignedLocations: string[] } | null
};
