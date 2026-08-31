import { editMessage, getMessageById, removeMessage } from '@/lib/messageService';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { cookies } from 'next/headers';

export const GET = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const message = await getMessageById(id);
  return Response.json({ message });
});

export const PATCH = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('session')?.value;
  const updates = await request.json();
  const updated = await editMessage(id, updates, sessionUserId);
  if (!updated) {
    return Response.json({ error: 'ไม่พบข้อความนี้' }, { status: 404 });
  }
  return Response.json({ ok: true, item: updated });
});

export const DELETE = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('session')?.value;
  const deleted = await removeMessage(id, sessionUserId);
  if (!deleted) {
    return Response.json({ error: 'ไม่พบข้อความนี้' }, { status: 404 });
  }
  return Response.json({ ok: true }, { status: 200 });
});
