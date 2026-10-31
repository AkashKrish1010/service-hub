import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// The old role-select splash screen has been completely removed.
// Redirect any legacy links directly to the modern onboarding screen.
export default function RoleSelectRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/onboarding');
  }, [router]);

  return null;
}
