import { App } from '@/components/app';

// The room cannot be mounted without a key, and Liveblocks retries a failing auth
// endpoint forever, so the check happens here rather than as a caught error.
export const dynamic = 'force-dynamic';

export default function Home() {
  return <App configured={Boolean(process.env.LIVEBLOCKS_SECRET_KEY)} />;
}
