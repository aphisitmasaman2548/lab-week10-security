import { createMessage, listMessages } from '@/lib/messageService';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { cookies } from 'next/headers';

export const GET = withErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';

  const all = await listMessages();
  const filtered = search
    ? all.filter((m: { name: string; message: string }) => m.name.includes(search) || m.message.includes(search))
    : all;

  return Response.json({ messages: filtered });
});

export const POST = withErrorHandling(async (request: Request) => {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('session')?.value;
  const body = await request.json();
  const saved = await createMessage(body, sessionUserId);
  return Response.json({ ok: true, item: saved }, { status: 201 });
});
