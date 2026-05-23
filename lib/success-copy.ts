import type { DeliveryMode } from '@/types';
import type { CategoryId } from '@/components/profile';
import { deliveryRequiresDate } from '@/lib/delivery';

export function getSubmitSuccessCopy(
  deliveryMode: DeliveryMode,
  category: CategoryId
): { title: string; body: string } {
  if (deliveryMode === 'comfort' || deliveryMode === 'bad_day') {
    return {
      title: 'Comfort capsule left.',
      body: 'They can open it whenever they need it — no date required.',
    };
  }

  if (deliveryRequiresDate(deliveryMode) || deliveryMode === 'custom') {
    return {
      title: 'Sealed for later.',
      body: 'It will arrive on the date you chose — nothing happens until then.',
    };
  }

  if (deliveryMode === 'tomorrow' || deliveryMode === '7days') {
    return {
      title: 'Scheduled.',
      body: 'It will arrive soon. They will know when it lands.',
    };
  }

  if (category === 'song_reminder') {
    return {
      title: 'Song trace left.',
      body: 'It should be in their inbox now.',
    };
  }

  return {
    title: 'Your trace was left.',
    body: "Whether it arrives now or later — it'll find its way.",
  };
}
