import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/og(.*)',
  '/api/username-check(.*)',
  '/api/user-resolve(.*)',
  '/api/cron(.*)',
  '/privacy',
  '/terms',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
  '/onboarding(.*)',
  '/traces(.*)',
]);

/** Single-segment paths that are public profiles, not app routes. */
function isPublicProfilePath(pathname: string): boolean {
  const segment = pathname.replace(/^\//, '').split('/')[0];
  if (!segment || segment.includes('.')) return false;
  const reserved = new Set([
    'sign-in',
    'sign-up',
    'dashboard',
    'settings',
    'onboarding',
    'traces',
    'api',
    'auth',
    'profile',
    'privacy',
    'terms',
    '_next',
  ]);
  return !reserved.has(segment.toLowerCase());
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(req) || isPublicProfilePath(pathname)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth().protect();
    return;
  }

  // Unknown routes: require auth
  await auth().protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
