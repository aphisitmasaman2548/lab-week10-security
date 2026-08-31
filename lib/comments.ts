// [UI Branch Definition] CommentItem with optional emoji reactions map
export interface CommentItem {
  id: string;
  itemId: string;
  author: string;
  content: string;
  reactions?: Record<string, number>;
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
      createdAt: new Date().toISOString(),
    },
  ];
}

export function addComment(data: Omit<CommentItem, 'id' | 'createdAt'>) {
  const item: CommentItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
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
