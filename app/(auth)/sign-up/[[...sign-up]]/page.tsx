import { SignUp } from '@clerk/nextjs';
import { AuthShell } from '@/components/auth/AuthShell';
import { tracesClerkAppearance } from '@/lib/clerk-appearance';

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/onboarding"
        appearance={tracesClerkAppearance}
      />
    </AuthShell>
  );
}
