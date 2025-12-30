import { createContext } from 'react';

type AuthContextProps = {
	session: unknown | null;
	user: unknown | null;
	isLoading: boolean;
	error: unknown | null;
}

// AuthContext value moved to its own module to keep the provider file exporting only components.
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
