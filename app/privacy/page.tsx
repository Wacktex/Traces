import type { Metadata } from 'next';
import { LegalPage, legalHeading, legalBody, legalList } from '@/components/shared/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Traces collects and uses your information.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 24, 2026">
      <p style={legalBody}>
        Traces (&quot;we,&quot; &quot;us&quot;) operates an anonymous messaging platform. This policy
        describes what we collect, why we collect it, and your choices.
      </p>

      <h2 style={legalHeading}>Information we collect</h2>
      <ul style={legalList}>
        <li>Account information — email address and authentication metadata when you sign up or sign in.</li>
        <li>Usernames and profile information — username, bio, profile image, and related settings you provide.</li>
        <li>Trace activity — traces you send or receive, categories, delivery settings, and related content stored to operate the service.</li>
        <li>Analytics and usage data — how you use Traces (e.g. pages visited, features used) to understand and improve the product.</li>
        <li>Security logs — technical logs such as IP addresses, device/browser data, and request metadata used to protect the platform.</li>
        <li>Cookies and session data — cookies and similar technologies used for sign-in, session management, and security (including via our authentication provider).</li>
      </ul>

      <h2 style={legalHeading}>How we use information</h2>
      <ul style={legalList}>
        <li>Operate the platform — create accounts, deliver traces, and provide core features.</li>
        <li>Improve product experience — understand usage and fix issues.</li>
        <li>Prevent abuse and fraud — rate limiting, moderation, and safety enforcement.</li>
        <li>Monitor reliability and security — detect incidents, abuse, and unauthorized access.</li>
      </ul>

      <h2 style={legalHeading}>Third-party services</h2>
      <p style={legalBody}>
        We use trusted providers to run Traces. They process data on our behalf under their own terms and
        privacy policies:
      </p>
      <ul style={legalList}>
        <li>Clerk — authentication and account management.</li>
        <li>Supabase — database and application data storage.</li>
        <li>Vercel — hosting and delivery of the application.</li>
      </ul>

      <h2 style={legalHeading}>We do not sell your data</h2>
      <p style={legalBody}>
        We do not sell your personal information. We share data only as needed to operate Traces, comply
        with law, or protect users and the service.
      </p>

      <h2 style={legalHeading}>Your rights and contact</h2>
      <p style={legalBody}>
        Depending on where you live, you may have rights to access, correct, or delete your data. To
        exercise these rights or ask questions about this policy, contact us at{' '}
        <a href="mailto:privacy@traces.app" style={{ color: '#c8bfaa' }}>
          privacy@traces.app
        </a>{' '}
        (placeholder — update before launch).
      </p>

      <p style={legalBody}>
        We may update this policy from time to time. Continued use of Traces after changes means you accept
        the updated policy.
      </p>
    </LegalPage>
  );
}
