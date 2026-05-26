import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** Legacy route — dashboard lives at `/` for signed-in users. */
export default function DashboardPage() {
  redirect('/');
}
