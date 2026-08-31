'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  tag?: string | null;
  createdAt: string | Date;
  authorId?: string | null;
}

interface Props {
  initialMessages: Message[];
  currentUserId?: string;
}

export default function MessageList({ initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; status?: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  // ฟังก์ชันทดสอบลบข้อความ (DELETE /api/messages/[id])
  async function handleDelete(messageId: string, authorName: string) {
    if (!confirm(`คุณต้องการลบข้อความของ "${authorName}" หรือไม่?`)) return;

    setLoading(messageId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          status: res.status,
          message: `✅ สำเร็จ (HTTP ${res.status}): ลบข้อความของ "${authorName}" เรียบร้อยแล้ว (คุณเป็นเจ้าของข้อความ)`,
        });
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        setFeedback({
          type: 'error',
          status: res.status,
          message: `🚫 ถูกปฏิเสธ (HTTP ${res.status} Forbidden): ${data.error || 'คุณไม่มีสิทธิ์ลบข้อความนี้'} (ไม่ใช่เจ้าของข้อความ)`,
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
      });
    } finally {
      setLoading(null);
    }
  }

  // ฟังก์ชันเริ่มแก้ไขข้อความ
  function startEdit(message: Message) {
    setEditingId(message.id);
    setEditText(message.message);
  }

  // ฟังก์ชันบันทึกการแก้ไข (PATCH /api/messages/[id])
  async function handleSaveEdit(messageId: string) {
    if (editText.trim().length < 5) {
      setFeedback({
        type: 'error',
        message: 'ข้อความต้องมีความยาวอย่างน้อย 5 ตัวอักษร',
      });
      return;
    }

    setLoading(messageId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editText }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          status: res.status,
          message: `✅ สำเร็จ (HTTP ${res.status}): แก้ไขข้อความเรียบร้อยแล้ว`,
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, message: editText } : m))
        );
        setEditingId(null);
      } else {
        setFeedback({
          type: 'error',
          status: res.status,
          message: `🚫 ถูกปฏิเสธ (HTTP ${res.status} Forbidden): ${data.error || 'คุณไม่มีสิทธิ์แก้ไขข้อความนี้'} (ไม่ใช่เจ้าของข้อความ)`,
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* กล่องแจ้งเตือนผลลัพธ์ Authorization Check */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{feedback.type === 'success' ? '🎉' : '🛡️'}</span>
            <div>
              <p className="font-semibold text-sm">{feedback.message}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {feedback.type === 'success'
                  ? 'การตรวจสอบ Authorization ผ่าน: authorId ตรงกับ session ปัจจุบัน'
                  : 'การตรวจสอบ Authorization บล็อกการเข้าถึง: ตรวจพบว่าไม่ใช่เจ้าของข้อมูล (ป้องกันช่องโหว่ BOLA/IDOR)'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 text-sm font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 border-b border-gray-100 flex items-center justify-between py-4">
          <div>
            <h2 className="text-lg font-bold text-blue-900">📬 รายการข้อความติดต่อ & ทดสอบสิทธิ์ (Authorization)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ทดลองกดปุ่ม <strong className="text-blue-600">"แก้ไข"</strong> หรือ <strong className="text-red-600">"ลบ"</strong> ในแต่ละรายการเพื่อดูผลลัพธ์สิทธิ์
            </p>
          </div>
          <Link href="/contact" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + ส่งข้อความใหม่
          </Link>
        </div>

        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>ยังไม่มีข้อความในระบบ</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((m) => {
              const isOwner = currentUserId && m.authorId === currentUserId;
              const isEditing = editingId === m.id;

              return (
                <div key={m.id} className="p-5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-900">{m.name}</span>
                      <span className="text-xs text-gray-400">({m.email})</span>
                      {m.tag && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          🏷️ {m.tag}
                        </span>
                      )}

                      {/* Badge แสดงสถานะความเป็นเจ้าของ */}
                      {isOwner ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                          ● ข้อความของคุณ (มีสิทธิ์)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-medium flex items-center gap-1">
                          🔒 ข้อความของผู้อื่น (ไม่มีสิทธิ์)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(m.createdAt).toLocaleString('th-TH')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(m))}
                          disabled={loading === m.id}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors"
                        >
                          {isEditing ? 'ยกเลิก' : '✏️ แก้ไข'}
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          disabled={loading === m.id}
                          className="px-2.5 py-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded transition-colors"
                        >
                          {loading === m.id ? 'กำลังดำเนินการ...' : '🗑️ ลบ'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2">
                      <label className="block text-xs font-medium text-blue-900">
                        แก้ไขเนื้อหาข้อความ (จะส่งคำขอ PATCH ไปยัง API):
                      </label>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => handleSaveEdit(m.id, m.name)}
                          disabled={loading === m.id || editText.trim() === ''}
                          className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded font-medium shadow-sm"
                        >
                          {loading === m.id ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {m.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
