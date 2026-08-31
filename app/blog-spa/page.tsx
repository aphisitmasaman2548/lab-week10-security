'use client';

import { useState, useEffect, Suspense } from 'react';
import type { ExternalItem } from '@/lib/external';
import type { CommentItem } from '@/lib/comments';
import { useRouter, useSearchParams } from 'next/navigation';
import CommentForm from '@/components/CommentForm';
import CommentReactions from '@/components/CommentReactions';
import Link from 'next/link';

function BlogSpaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // อ่านค่าเริ่มต้นจาก URL
    const initialSource = searchParams.get('source') || 'products';
    const initialQuery = searchParams.get('q') || '';
    const initialDetailId = searchParams.get('detail') || null;

    const [items, setItems] = useState<ExternalItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [source, setSource] = useState<string>(initialSource);
    const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
    const [selectedId, setSelectedId] = useState<string | null>(initialDetailId);

    // Workshop State: คอมเมนต์และการเข้าสู่ระบบ
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Sync state ขึ้น URL
    function syncURL(s: string, q: string, d: string | null) {
        const params = new URLSearchParams();
        if (s) params.set('source', s);
        if (q.trim()) params.set('q', q.trim());
        if (d) params.set('detail', d);
        router.replace(`/blog-spa?${params.toString()}`);
    }

    // ตรวจสอบการ Login โดยยิงถาม API Route (เพราะ Cookie เป็น HttpOnly)
    useEffect(() => {
        fetch('/api/login')
            .then((r) => r.json())
            .then((data) => setIsLoggedIn(!!data.isLoggedIn))
            .catch(() => setIsLoggedIn(false));
    }, []);

    // ดึงข้อมูลเมื่อ source เปลี่ยน
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetch(`/api/aggregate?source=${source}`)
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok || data.error) {
                    throw new Error(data.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
                }
                return data;
            })
            .then((data: { external: ExternalItem[] }) => {
                setItems(data.external || []);
                setIsLoading(false);
            })
            .catch((err: Error) => {
                setError(err.message);
                setItems([]);
                setIsLoading(false);
            });
    }, [source]);

    // โหลดคอมเมนต์เมื่อเปิด Modal ดูรายละเอียด
    const fetchComments = (itemId: string) => {
        fetch(`/api/comments?itemId=${itemId}`)
            .then((res) => res.json())
            .then((data) => setComments(data.comments || []))
            .catch(() => setComments([]));
    };

    useEffect(() => {
        if (selectedId) {
            fetchComments(selectedId);
        }
    }, [selectedId]);

    function selectSource(s: string) {
        setSource(s);
        syncURL(s, searchTerm, selectedId);
    }

    function handleSearch(q: string) {
        setSearchTerm(q);
        syncURL(source, q, selectedId);
    }

    function openDetail(id: string) {
        setSelectedId(id);
        syncURL(source, searchTerm, id);
    }

    function closeDetail() {
        setSelectedId(null);
        syncURL(source, searchTerm, null);
    }

    const filteredItems = items.filter((item) => {
        const q = searchTerm.toLowerCase();
        return (
            item.title.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q))
        );
    });

    const selectedItem = items.find((item) => item.id === selectedId) || null;

    return (
        <main className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-blue-900">
                    🧩 Blog Aggregator (SPA)
                </h1>
                <div className="flex gap-2">
                    {isLoggedIn ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium flex items-center gap-1">
                            ✓ เข้าสู่ระบบแล้ว
                        </span>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                        >
                            🔑 เข้าสู่ระบบ (เพื่อแสดงความคิดเห็น)
                        </Link>
                    )}
                </div>
            </div>

            {/* Search Box & Source Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => selectSource('products')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            source === 'products'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => selectSource('news')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            source === 'news'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        News
                    </button>
                </div>

                {/* Input ค้นหา */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="ค้นหา..."
                    className="p-2 border rounded-lg w-full sm:w-64 text-sm focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Loading / Error / Empty States */}
            {isLoading ? (
                <p className="text-gray-400">กำลังโหลด...</p>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <p className="font-semibold">เกิดข้อผิดพลาด: {error}</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <p className="text-gray-500 py-4">ไม่พบข้อมูลที่ค้นหา</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => openDetail(item.id)}
                            className="p-4 bg-white rounded-lg border hover:border-blue-500 cursor-pointer transition-all shadow-sm"
                        >
                            <h2 className="font-bold text-blue-800">{item.title}</h2>
                            <p className="text-gray-500 text-sm mt-1">{item.subtitle}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal รายละเอียด + Workshop Comment Feature */}
            {selectedId && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto"
                    onClick={closeDetail}
                >
                    <div
                        className="bg-white p-6 rounded-lg max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                            รายละเอียดเพิ่มเติม
                        </h3>
                        {selectedItem ? (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">ID: {selectedItem.id}</p>
                                <h4 className="font-bold text-gray-800 mb-2">{selectedItem.title}</h4>
                                <p className="text-sm text-gray-600 mb-4">{selectedItem.subtitle}</p>
                                {selectedItem.image && (
                                    <img
                                        src={selectedItem.image}
                                        alt={selectedItem.title}
                                        className="h-32 object-contain mx-auto mb-4"
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm mb-4">ไม่พบรายละเอียดของรายการนี้</p>
                        )}

                        {/* ส่วนแสดงความคิดเห็น (Workshop Feature) */}
                        <div className="mt-6 border-t pt-4">
                            <h4 className="font-bold text-gray-800 text-sm mb-3">
                                💬 ความคิดเห็น ({comments.length})
                            </h4>

                            {comments.length === 0 ? (
                                <p className="text-xs text-gray-400 italic mb-4">ยังไม่มีความคิดเห็น</p>
                            ) : (
                                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                    {comments.map((c) => (
                                        <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs shadow-2xs">
                                            <div className="flex justify-between font-semibold text-gray-700">
                                                <span>{c.author}</span>
                                                <span className="text-gray-400 text-[10px]">
                                                    {new Date(c.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1">{c.content}</p>
                                            <CommentReactions
                                                commentId={c.id}
                                                initialReactions={c.reactions}
                                                onReactionSuccess={() => selectedId && fetchComments(selectedId)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* การป้องกันด้วย Authentication: หาก Login แล้วแสดงฟอร์ม หากยังไม่ Login ให้แจ้งเตือน */}
                            {isLoggedIn ? (
                                <CommentForm
                                    itemId={selectedId}
                                    onCommentAdded={() => fetchComments(selectedId)}
                                />
                            ) : (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex justify-between items-center">
                                    <span>🔒 กรุณาเข้าสู่ระบบก่อนเพื่อเพิ่มความคิดเห็น</span>
                                    <Link
                                        href="/login"
                                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors"
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeDetail}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task W.4: MVC Self-Mapping Table */}
            <div className="mt-12 pt-6 border-t">
                <h2 className="text-lg font-bold text-blue-900 mb-4">Task W.4 — MVC Self-Mapping</h2>
                <table className="w-full text-sm text-left border">
                    <thead>
                        <tr className="bg-gray-100 border-b text-black">
                            <th className="p-2 border">MVC Layer</th>
                            <th className="p-2 border">ไฟล์ในโปรเจกต์</th>
                            <th className="p-2 border">หน้าที่</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-2 border font-semibold">Model</td>
                            <td className="p-2 border">
                                <code>lib/comments.ts</code>
                            </td>
                            <td className="p-2 border">เก็บข้อมูลโครงสร้าง CommentItem (in-memory) และฟังก์ชัน addComment / getCommentsByItemId</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 border font-semibold">View</td>
                            <td className="p-2 border">
                                <code>components/CommentForm.tsx</code><br />
                                <code>app/blog-spa/page.tsx</code>
                            </td>
                            <td className="p-2 border">แสดง Controlled Form รับข้อความความคิดเห็น แสดงรายการความคิดเห็น และแจ้งเตือนเมื่อไม่ได้ Login</td>
                        </tr>
                        <tr>
                            <td className="p-2 border font-semibold">Controller</td>
                            <td className="p-2 border">
                                <code>app/api/comments/route.ts</code>
                            </td>
                            <td className="p-2 border">รับ HTTP Request (GET/POST), ตรวจสอบ Session Cookie (Auth Check) และทำ Server Validation ก่อนบันทึกลง Model</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Task W.5: Reflection (เขียนสั้นๆ แนบท้าย) */}
            <div className="mt-8 pt-6 border-t bg-gray-50 p-6 rounded-lg border">
                <h2 className="text-lg font-bold text-blue-900 mb-4">Task W.5 — Reflection</h2>
                <div className="space-y-4 text-sm text-gray-700">
                    <div>
                        <h3 className="font-bold text-gray-900">1. การอธิบายฟีเจอร์และการป้องกัน:</h3>
                        <p>
                            ฟีเจอร์ที่พัฒนาเพิ่มคือ <strong>&quot;ระบบแสดงความคิดเห็นใต้โพสต์/สินค้า&quot;</strong> ซึ่งเก็บข้อมูล รหัสโพสต์ (itemId), ข้อความ (content), และชื่อผู้เขียน (author) ฟีเจอร์นี้ป้องกันโดยกำหนดให้เฉพาะผู้ใช้ที่ผ่านการยืนยันตัวตน (Login มี session cookie) เท่านั้นที่สามารถส่งคอมเมนต์ได้
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900">2. จุดที่ต้องเลือกระหว่างวิธีทางเลือก:</h3>
                        <p>
                            ในการตรวจสอบ Authentication ได้เลือกระหว่างการใช้ Middleware กับการตรวจสอบใน Component/API Route โดยเลือกตรวจ Cookie session ใน API Route (<code>/api/comments</code>) และ Render UI ตามสถานะเพื่อมอบ User Experience ที่ดีที่สุด (ให้ผู้ใช้ที่ยังไม่ Login สามารถอ่านคอมเมนต์ได้ แต่จะล็อคเฉพาะส่วนฟอร์มคอมเมนต์)
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900">3. สิ่งที่ต้องเพิ่มด้านความปลอดภัยบน Production จริง:</h3>
                        <p>
                            หากต้องนำขึ้น Production จริง ควรเปลี่ยนจากการเก็บข้อมูลใน Memory เป็น Database (PostgreSQL/Prisma), เปลี่ยน session cookie แบบไก่กาเป็น JWT/OAuth ผ่าน NextAuth.js (Auth.js) พร้อมทำ Rate Limiting และ Sanitization ป้องกัน XSS/CSRF
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function BlogSpaPage() {
    return (
        <Suspense fallback={<div className="p-8 text-gray-500">กำลังโหลด...</div>}>
            <BlogSpaContent />
        </Suspense>
    );
}