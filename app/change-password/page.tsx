'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side quick checks
    if (!oldPassword) {
      setError('กรุณาระบุรหัสผ่านปัจจุบัน');
      return;
    }
    if (newPassword.length < 8) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError('กรุณาเข้าสู่ระบบก่อนทำการเปลี่ยนรหัสผ่าน');
          setTimeout(() => router.push('/login'), 1500);
          return;
        }
        setError(data.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        return;
      }

      setSuccess('🎉 เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
          ← กลับหน้า Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔐</span>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">เปลี่ยนรหัสผ่าน</h1>
            <p className="text-gray-500 text-sm mt-0.5">กำหนดรหัสผ่านใหม่สำหรับความปลอดภัยของบัญชี</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              รหัสผ่านเดิม (Old Password)
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              className="border border-gray-300 p-2.5 w-full rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              รหัสผ่านใหม่ (New Password)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              className="border border-gray-300 p-2.5 w-full rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">ต้องมีความยาวอย่างน้อย 8 ตัวอักษร</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ยืนยันรหัสผ่านใหม่ (Confirm New Password)
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className="border border-gray-300 p-2.5 w-full rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </main>
  );
}
