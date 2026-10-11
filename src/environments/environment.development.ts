export const environment = {
  production: false,
  // Use 'http://localhost:8080' when running the backend locally.
  apiUrl: 'https://handicraftbackend.onrender.com',
  /** Temporary local login used while the backend is unavailable. Development builds only. */
  devLogin: {
    loginId: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    assignedLocations: [] as string[]
  } as { loginId: string; password: string; role: 'admin' | 'store_manager'; assignedLocations: string[] } | null
};
