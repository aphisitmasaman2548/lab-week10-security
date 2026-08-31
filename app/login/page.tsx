'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('เข้าสู่ระบบไม่สำเร็จ (อีเมลหรือรหัสผ่านไม่ถูกต้อง)');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  function fillAccount(testEmail: string, testPass: string) {
    setEmail(testEmail);
    setPassword(testPass);
    setError('');
  }

  return (
    <main className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-blue-900">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลเพื่อเข้าสู่ระบบและทดสอบสิทธิ์ Authorization</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tsu.ac.th"
              className="border border-gray-300 p-2.5 w-full rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-gray-300 p-2.5 w-full rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">⚡ เลือกบัญชีเพื่อทดสอบสิทธิ์สลับกันได้ทันที:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillAccount('admin@tsu.ac.th', '1234')}
              className="p-2.5 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all"
            >
              <p className="text-xs font-bold text-blue-900">👤 บัญชี 1 (Admin / Alice)</p>
              <p className="text-[11px] text-gray-500">admin@tsu.ac.th</p>
              <p className="text-[10px] text-gray-400">รหัส: 1234</p>
            </button>

            <button
              type="button"
              onClick={() => fillAccount('bob@tsu.ac.th', '1234')}
              className="p-2.5 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all"
            >
              <p className="text-xs font-bold text-blue-900">👤 บัญชี 2 (Bob)</p>
              <p className="text-[11px] text-gray-500">bob@tsu.ac.th</p>
              <p className="text-[10px] text-gray-400">รหัส: 1234</p>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
