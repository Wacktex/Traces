import { Grain } from '@/components/shared';
import { BrandLink } from '@/components/shared/BrandLink';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page auth-page--premium">
      <div className="auth-page__atmosphere" aria-hidden />
      <Grain />
      <BrandLink className="auth-page__brand" />
      <div className="auth-page__card-wrap">{children}</div>
    </div>
  );
}
