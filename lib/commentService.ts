import { cleanRichText } from './sanitize';
import * as CommentModel from './comments';

export async function createComment(data: { itemId: string; author: string; content: string }) {
  const safeContent = cleanRichText(data.content); // ตัด <script>, onerror= ทิ้งก่อนเก็บ
  return CommentModel.addComment({ ...data, content: safeContent });
}

export async function listComments(itemId?: string) {
  if (itemId) {
    return CommentModel.getCommentsByItemId(itemId);
  }
  return CommentModel.getAllComments();
}

export async function reactToComment(commentId: string, emoji: CommentModel.ReactionType) {
  const allowedEmojis: CommentModel.ReactionType[] = ['👍', '❤️', '😂', '🔥'];
  if (!allowedEmojis.includes(emoji)) {
    throw new Error('ประเภทอีโมจิไม่ถูกต้อง');
  }
  const updated = CommentModel.addReaction(commentId, emoji);
  if (!updated) {
    throw new Error('ไม่พบคอมเมนต์ที่ต้องการ React');
  }
  return updated;
}
