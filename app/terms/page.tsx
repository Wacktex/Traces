import type { Metadata } from 'next';
import { LegalPage, legalHeading, legalBody, legalList } from '@/components/shared/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using Traces.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="May 24, 2026">
      <p style={legalBody}>
        By using Traces, you agree to these terms. If you do not agree, do not use the service.
      </p>

      <h2 style={legalHeading}>Anonymous traces</h2>
      <p style={legalBody}>
        Visitors may leave anonymous traces on public profiles without creating an account. Senders are
        responsible for what they submit. Receivers control how they view and manage traces on their
        profile.
      </p>

      <h2 style={legalHeading}>Prohibited conduct</h2>
      <p style={legalBody}>You may not use Traces to:</p>
      <ul style={legalList}>
        <li>Harass, threaten, or abuse others.</li>
        <li>Send spam, scams, or unsolicited bulk messages.</li>
        <li>Post illegal content or content that violates others&apos; rights.</li>
        <li>Attempt to bypass security, rate limits, or moderation.</li>
      </ul>

      <h2 style={legalHeading}>Moderation and removal</h2>
      <p style={legalBody}>
        We may review, remove, or limit traces and accounts that violate these terms or harm the
        community. We are not obligated to monitor all content but may act when abuse is reported or
        detected.
      </p>

      <h2 style={legalHeading}>Account suspension</h2>
      <p style={legalBody}>
        We may suspend or terminate accounts that violate these terms, create risk for others, or
        interfere with the service. You may stop using Traces at any time.
      </p>

      <h2 style={legalHeading}>Your responsibility</h2>
      <p style={legalBody}>
        You are responsible for your account credentials, profile information, and compliance with
        applicable laws. Traces is provided for personal use; you use it at your own discretion.
      </p>

      <h2 style={legalHeading}>Service availability</h2>
      <p style={legalBody}>
        We aim to keep Traces running smoothly but do not guarantee uninterrupted or error-free
        service. We are not liable for downtime, data loss, or issues beyond our reasonable control.
      </p>

      <h2 style={legalHeading}>Changes to the service</h2>
      <p style={legalBody}>
        Traces may change, add, or remove features over time. We may update these terms; continued use
        after updates means you accept the revised terms.
      </p>

      <h2 style={legalHeading}>Contact</h2>
      <p style={legalBody}>
        Questions about these terms:{' '}
        <a href="mailto:legal@traces.app" style={{ color: '#c8bfaa' }}>
          legal@traces.app
        </a>{' '}
        (placeholder — update before launch).
      </p>
    </LegalPage>
  );
}
