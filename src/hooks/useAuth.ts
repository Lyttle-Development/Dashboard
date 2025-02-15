import {useEffect} from 'react';
import {signIn, useSession} from 'next-auth/react';
import {isAllowedUser} from '@/lib/auth';

/**
 * Custom hook to handle authentication logic
 */
export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn("discord"); // Redirect to Discord login
    }
  }, [status]);

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const isAllowed = isAuthenticated && isAllowedUser(session);

  return { session, isLoading, isAuthenticated, isAllowed };
}
