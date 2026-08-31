import { reactToComment } from '@/lib/commentService';
import type { ReactionType } from '@/lib/comments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { commentId, emoji } = body;

    if (!commentId || typeof commentId !== 'string') {
      return Response.json({ error: 'ไม่ระบุรหัสคอมเมนต์ (commentId)' }, { status: 400 });
    }

    if (!emoji || typeof emoji !== 'string') {
      return Response.json({ error: 'ไม่ระบุอีโมจิที่ต้องการ react' }, { status: 400 });
    }

    const updatedComment = await reactToComment(commentId, emoji as ReactionType);

    return Response.json({ ok: true, comment: updatedComment }, { status: 200 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการ React';
    return Response.json({ error: errorMsg }, { status: 400 });
  }
}
