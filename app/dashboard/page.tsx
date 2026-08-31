import { getMessages } from '@/lib/messages';
import { findUserById } from '@/lib/users';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import MessageList from '@/components/MessageList';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('session')?.value;
  const currentUser = currentUserId ? await findUserById(currentUserId) : null;

  let messages: Array<{ id: string; name: string; email: string; message: string; createdAt: Date; authorId?: string | null }> = [];
  try {
    messages = await getMessages();
  } catch (err) {
    console.error('Failed to load messages:', err);
  }

  const serializedMessages = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <main className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <span>📊</span> แผงควบคุม (Dashboard)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            เข้าสู่ระบบในฐานะ: <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{currentUser?.email || 'ผู้ใช้ทั่วไป'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/change-password"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>🔐</span> เปลี่ยนรหัสผ่าน
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            ✉️
          </div>
          <div>
            <p className="text-gray-500 text-sm">จำนวนข้อความทั้งหมด</p>
            <p className="text-3xl font-bold text-blue-900">{messages.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl font-bold">
            🛡️
          </div>
          <div>
            <p className="text-gray-500 text-sm">สถานะความปลอดภัย (Security)</p>
            <p className="text-base font-semibold text-green-700">Bcrypt + Zod + Auth Guard เปิดใช้งาน</p>
          </div>
        </div>
      </div>

      <MessageList initialMessages={serializedMessages} currentUserId={currentUserId} />
    </main>
  );
}
