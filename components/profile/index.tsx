'use client';
// ================================================================
// TRACES — Profile Components
// components/profile/
// ================================================================

import { useState } from 'react';
import { AmbientBg, BackBtn } from '@/components/shared';
import { ComposeFlow }        from '@/components/traces/ComposeFlow';
import { track }              from '@/lib/analytics';
import { CATEGORY_GROUPS }    from '@/lib/categories';
import type { PublicProfile } from '@/types';

// ── Category definitions ──────────────────────────────────────────
export const CATEGORIES = [
  { id: 'first_impression',       icon: '◎', label: 'First Impression',        placeholder: 'The first thing I noticed was…' },
  { id: 'one_word',               icon: '◇', label: 'One Word',                placeholder: 'If I had to choose one word for you…' },
  { id: 'midnight_thought',       icon: '△', label: 'Midnight Thought',         placeholder: 'At 2am I thought about…' },
  { id: 'something_id_never_say', icon: '◈', label: "Something I'd Never Say", placeholder: "I probably shouldn't say this, but…" },
  { id: 'memory',                 icon: '○', label: 'Memory',                   placeholder: 'I keep going back to the moment when…' },
  { id: 'assumption',             icon: '⬡', label: 'Assumption',               placeholder: 'My guess about you is…' },
  { id: 'compliment',             icon: '◻', label: 'Compliment',               placeholder: 'Something I genuinely admire…' },
  { id: 'song_reminder',          icon: '♫', label: 'Song Reminder',            placeholder: 'This song feels like you because…' },
  { id: 'confession',             icon: '◐', label: 'Confession',               placeholder: "Here's something I've held back…" },
  { id: 'freeform',               icon: '—', label: 'Freeform',                 placeholder: 'Say whatever you came here to say.' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

// ── CategoryGrid ──────────────────────────────────────────────────
interface CategoryGridProps {
  onSelect: (categoryId: CategoryId) => void;
}

export function CategoryGrid({ onSelect }: CategoryGridProps) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', animation: 'fadeUp 0.5s ease 0.15s both' }}>
      {CATEGORY_GROUPS.map((group, gi) => (
        <div key={group.id} style={{ marginBottom: gi < CATEGORY_GROUPS.length - 1 ? 28 : 0 }}>
          <p style={{
            fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '0.18em',
            color: '#5a5856', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {group.label}
          </p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#4a4846', marginBottom: 12, lineHeight: 1.5 }}>
            {group.description}
          </p>
          <div className="category-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 10,
          }}>
            {group.categories.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId)!;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id as CategoryId)}
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18,
                    padding: '16px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-3px)';
                    el.style.borderColor = 'rgba(255,255,255,0.14)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  <span style={{ fontSize: 15, color: '#7a7672' }}>{cat.icon}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#f0ece4', lineHeight: 1.3 }}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ProfileHeader ─────────────────────────────────────────────────
interface ProfileHeaderProps {
  profile: PublicProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div style={{
      textAlign:    'center',
      maxWidth:     480,
      margin:       '0 auto 40px',
      animation:    'fadeUp 0.5s ease both',
    }}>
      {/* Avatar */}
      <div style={{
        width:          72,
        height:         72,
        borderRadius:   '50%',
        background:     'rgba(44,74,62,0.45)',
        border:         '1px solid rgba(255,255,255,0.08)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        margin:         '0 auto 16px',
        overflow:       'hidden',
      }}>
        {profile.profile_image
          ? <img src={profile.profile_image} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: 'var(--serif)', fontSize: 28, color: '#c8bfaa' }}>{profile.username[0].toUpperCase()}</span>
        }
      </div>

      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: '#f0ece4', marginBottom: 8 }}>
        {profile.username}
      </h1>
      {profile.bio && (
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#7a7672', lineHeight: 1.65, marginBottom: 6 }}>
          {profile.bio}
        </p>
      )}
      <p style={{ fontFamily: 'var(--sans)', fontSize: 10.5, color: '#3a3836', letterSpacing: '0.12em' }}>
        traces.app/{profile.username}
      </p>
    </div>
  );
}

// ── ProfilePageClient ─────────────────────────────────────────────
interface ProfilePageClientProps {
  profile: PublicProfile;
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    track('trace_compose_started', { category: categoryId });
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  // Composing — show the full compose flow
  if (selectedCategory) {
    return (
      <ComposeFlow
        profile={profile}
        initialCategory={selectedCategory}
        onBack={handleBack}
      />
    );
  }

  // Default — category picker
  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: '#0B0B0C', padding: '60px 20px 48px', position: 'relative' }}>
      <AmbientBg />
      <BackBtn href="/" />

      <ProfileHeader profile={profile} />

      <p style={{
        fontFamily: 'var(--serif)',
        fontStyle:  'italic',
        fontSize:   18,
        color:      '#c8bfaa',
        textAlign:  'center',
        maxWidth:   480,
        margin:     '0 auto 32px',
        animation:  'fadeUp 0.5s ease 0.08s both',
      }}>
        What trace do you want to leave?
      </p>

      <CategoryGrid onSelect={handleCategorySelect} />
    </div>
  );
}
