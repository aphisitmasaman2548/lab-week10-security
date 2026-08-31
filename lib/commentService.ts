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
