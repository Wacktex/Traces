import type { CapsuleCondition, DeliveryMode } from '@/types';

export type DeliverySection = 'now' | 'soon' | 'milestone' | 'comfort' | 'date';

export interface DeliveryOption {
  id: DeliveryMode;
  label: string;
  section: DeliverySection;
  hint?: string;
  requiresDate?: boolean;
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'now', label: 'Now', section: 'now' },
  { id: 'tomorrow', label: 'Tomorrow', section: 'soon' },
  { id: '7days', label: 'In 7 days', section: 'soon' },
  {
    id: 'milestone_graduation',
    label: 'After graduation',
    section: 'milestone',
    hint: 'Choose the date it should unlock.',
    requiresDate: true,
  },
  {
    id: 'milestone_finals',
    label: 'After finals',
    section: 'milestone',
    hint: 'Choose the date it should unlock.',
    requiresDate: true,
  },
  {
    id: 'milestone_birthday',
    label: 'On their birthday',
    section: 'milestone',
    hint: 'Choose the date it should unlock.',
    requiresDate: true,
  },
  {
    id: 'comfort',
    label: 'Open when needed',
    section: 'comfort',
    hint: 'They open it themselves — for difficult days.',
  },
  {
    id: 'custom',
    label: 'Pick a date',
    section: 'date',
    hint: 'Arrives on the date you choose.',
    requiresDate: true,
  },
];

export const DELIVERY_SECTION_LABELS: Record<DeliverySection, string> = {
  now: 'Arrive now',
  soon: 'Arrive soon',
  milestone: 'Milestone',
  comfort: 'Comfort capsule',
  date: 'Specific date',
};

export interface ResolvedDelivery {
  scheduledTime: Date | null;
  capsuleCondition: CapsuleCondition | null;
  unlockDate: string | null;
  isTimed: boolean;
}

/** Map delivery + user-chosen dates into DB fields. No inferred event dates. */
export function resolveDelivery(
  mode: DeliveryMode,
  dates?: { customDate?: string; milestoneDate?: string }
): ResolvedDelivery {
  const now = new Date();
  const pickDate = (iso?: string): Date | null => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  switch (mode) {
    case 'now':
      return { scheduledTime: null, capsuleCondition: null, unlockDate: null, isTimed: false };
    case 'tomorrow':
      return {
        scheduledTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        capsuleCondition: 'date',
        unlockDate: null,
        isTimed: true,
      };
    case '7days':
      return {
        scheduledTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        capsuleCondition: 'date',
        unlockDate: null,
        isTimed: true,
      };
    case 'milestone_graduation': {
      const d = pickDate(dates?.milestoneDate);
      return {
        scheduledTime: d,
        capsuleCondition: 'graduation',
        unlockDate: d?.toISOString() ?? null,
        isTimed: true,
      };
    }
    case 'milestone_finals': {
      const d = pickDate(dates?.milestoneDate);
      return {
        scheduledTime: d,
        capsuleCondition: 'finals',
        unlockDate: d?.toISOString() ?? null,
        isTimed: true,
      };
    }
    case 'milestone_birthday': {
      const d = pickDate(dates?.milestoneDate);
      return {
        scheduledTime: d,
        capsuleCondition: 'date',
        unlockDate: d?.toISOString() ?? null,
        isTimed: true,
      };
    }
    case 'comfort':
      return {
        scheduledTime: null,
        capsuleCondition: 'manual',
        unlockDate: null,
        isTimed: true,
      };
    case 'custom': {
      const d = pickDate(dates?.customDate);
      return {
        scheduledTime: d,
        capsuleCondition: 'custom',
        unlockDate: d?.toISOString() ?? null,
        isTimed: true,
      };
    }
    // Legacy modes from older clients
    case 'graduation': {
      const d = pickDate(dates?.milestoneDate ?? dates?.customDate);
      return {
        scheduledTime: d,
        capsuleCondition: 'graduation',
        unlockDate: d?.toISOString() ?? null,
        isTimed: true,
      };
    }
    case 'bad_day':
      return {
        scheduledTime: null,
        capsuleCondition: 'manual',
        unlockDate: null,
        isTimed: true,
      };
    default:
      return { scheduledTime: null, capsuleCondition: null, unlockDate: null, isTimed: false };
  }
}

export function deliveryRequiresDate(mode: DeliveryMode): boolean {
  return DELIVERY_OPTIONS.some(o => o.id === mode && o.requiresDate);
}

export function formatCapsuleLabel(
  condition: string,
  unlockDate: string | null
): string {
  const dateStr = unlockDate
    ? new Date(unlockDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  switch (condition) {
    case 'graduation':
      return dateStr ? `Sealed until graduation (${dateStr}).` : 'Sealed until graduation day.';
    case 'finals':
      return dateStr ? `Sealed until after finals (${dateStr}).` : 'Sealed until after finals.';
    case 'manual':
    case 'bad_day':
      return 'Comfort capsule — open when you need it.';
    case 'date':
    case 'custom':
      return dateStr ? `Sealed until ${dateStr}.` : 'Sealed until the chosen date.';
    default:
      return 'Sealed.';
  }
}

export function isComfortCapsule(condition: string): boolean {
  return condition === 'manual' || condition === 'bad_day';
}
