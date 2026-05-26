import { SignIn } from '@clerk/nextjs';
import { AuthShell } from '@/components/auth/AuthShell';
import { tracesClerkAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/"
        appearance={tracesClerkAppearance}
      />
    </AuthShell>
  );
}
