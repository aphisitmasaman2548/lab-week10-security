import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | My Blog', default: 'My Blog' },
  description: 'บล็อกส่วนตัว สร้างด้วย Next.js + TypeScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-blue-900 text-white px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-white hover:text-blue-300">
              📝 My Blog
            </Link>
            <div className="flex gap-4">
              <Link href="/posts" className="hover:text-blue-300 transition-colors">บทความ</Link>
              <Link href="/users" className="hover:text-blue-300 transition-colors">ผู้ใช้</Link>
              <Link href="/contact" className="hover:text-blue-300 transition-colors">ติดต่อเรา</Link>
              <Link href="/about" className="hover:text-blue-300 transition-colors">เกี่ยวกับ</Link>
            </div>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors border border-blue-600/40 flex items-center gap-1.5"
            >
              <span>📊</span> Dashboard
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {children}
        </div>
        <footer className="text-center py-6 text-gray-400 text-sm border-t mt-8">
          <p>© 2026 My Blog — สร้างด้วย Next.js + TypeScript (L4 Test Failure Simulation)</p>
          <p className="mt-1">0214321 Web App Design & Development</p>
        </footer>
      </body>
    </html>
  );
}