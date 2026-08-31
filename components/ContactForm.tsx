'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tag, setTag] = useState('General');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  function validate() {
    if (name.trim().length < 2) return 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
    if (!email.includes('@')) return 'อีเมลไม่ถูกต้อง';
    if (message.trim().length < 5) return 'ข้อความสั้นเกินไป';
    return '';
  }

  const isValid =
    name.trim().length >= 2 &&
    email.includes('@') &&
    message.trim().length >= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, tag }),
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setTag('General');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อ"
        className="border p-2 w-full rounded"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="อีเมล"
        className="border p-2 w-full rounded"
      />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          🏷️ หมวดหมู่ / Tag: <span className="text-gray-400 font-normal">(เลือกหมวดหมู่ที่ต้องการติดต่อ)</span>
        </label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="border p-2 w-full rounded bg-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="General">💬 General (ทั่วไป)</option>
          <option value="Feedback">⭐ Feedback (ข้อเสนอแนะ)</option>
          <option value="Inquiry">❓ Inquiry (สอบถามข้อมูล)</option>
          <option value="Support">🛠️ Support (แจ้งปัญหา)</option>
        </select>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="ข้อความ"
        className="border p-2 w-full rounded"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!isValid || status === 'sending'}
        className={`px-4 py-2 text-white rounded transition-colors ${
          isValid && status !== 'sending' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        ส่งข้อความ
      </button>

      {status === 'sending' && <p className="text-gray-400">กำลังส่ง...</p>}
      {status === 'success' && <p className="text-green-600">ส่งสำเร็จ</p>}
      {status === 'error' && <p className="text-red-600">ส่งไม่สำเร็จ ลองใหม่อีกครั้ง</p>}
    </form>
  );
}
