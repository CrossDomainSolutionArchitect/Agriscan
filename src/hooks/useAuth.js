import { useUser, useClerk } from '@clerk/clerk-react'

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { openSignIn, signOut } = useClerk()
  return { isLoaded, isSignedIn, user, signIn: openSignIn, signOut }
}