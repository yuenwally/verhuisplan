import { Liveblocks } from '@liveblocks/node';
import { avatarFor, colorFor } from '@/lib/identity';
import { ROOM_ID } from '@/lib/plan-config';

const secret = process.env.LIVEBLOCKS_SECRET_KEY;

export async function POST(request: Request) {
  if (!secret) {
    return Response.json(
      { error: 'LIVEBLOCKS_SECRET_KEY is not set' },
      { status: 500 },
    );
  }

  const { name } = (await request.json()) as { name?: unknown };

  if (typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'A name is required' }, { status: 400 });
  }

  const trimmed = name.trim();
  const liveblocks = new Liveblocks({ secret });

  // Identity is the name itself: there are no accounts, and two tabs claiming
  // the same name are meant to be the same person.
  const session = liveblocks.prepareSession(trimmed.toLowerCase(), {
    userInfo: {
      name: trimmed,
      avatar: avatarFor(trimmed),
      color: colorFor(trimmed),
    },
  });

  session.allow(ROOM_ID, session.FULL_ACCESS);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
