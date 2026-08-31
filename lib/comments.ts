export type ReactionType = '👍' | '❤️' | '😂' | '🔥';

export interface CommentItem {
  id: string;
  itemId: string;
  author: string;
  content: string;
  reactions: Record<ReactionType, number>;
  createdAt: string;
}

// ใช้ globalThis เพื่อแชร์ memory array ข้าม Next.js bundles
const globalForComments = globalThis as unknown as {
  comments: CommentItem[];
};

if (!globalForComments.comments) {
  globalForComments.comments = [
    {
      id: 'c1',
      itemId: '1',
      author: 'admin@tsu.ac.th',
      content: 'สินค้านี้คุณภาพดีมากๆ ครับ!',
      reactions: { '👍': 3, '❤️': 2, '😂': 0, '🔥': 1 },
      createdAt: new Date().toISOString(),
    },
  ];
}

export function addComment(data: Omit<CommentItem, 'id' | 'createdAt' | 'reactions'>) {
  const item: CommentItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    reactions: { '👍': 0, '❤️': 0, '😂': 0, '🔥': 0 },
    ...data,
  };
  globalForComments.comments.push(item);
  return item;
}

export function getCommentsByItemId(itemId: string) {
  return globalForComments.comments.filter((c) => c.itemId === itemId);
}

export function getAllComments() {
  return globalForComments.comments;
}

export function addReaction(commentId: string, emoji: ReactionType): CommentItem | null {
  const comment = globalForComments.comments.find((c) => c.id === commentId);
  if (!comment) return null;
  if (!comment.reactions) {
    comment.reactions = { '👍': 0, '❤️': 0, '😂': 0, '🔥': 0 };
  }
  comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
  return comment;
}
