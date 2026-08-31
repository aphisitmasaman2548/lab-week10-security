# รายงานปฏิบัติการ: Version Control, Collaborative Workflow และ Code Review
**วิชา**: Web Application Development | **ภาคเรียนที่**: 1/2569

---

## 1. ข้อมูลสมาชิกในกลุ่ม
- **คนที่ 1 (Role 1: Backend / API & Database)**:
  - ชื่อ-นามสกุล: นายอภิสิทธิ์ มาสะมัน
  - รหัสนักศึกษา: [กรอกรหัสนักศึกษา]
  - บทบาทหน้าที่: ออกแบบ Message Tag Schema ใน Prisma, พัฒนา Backend API & Model สำหรับ Comment Reaction (`feature/comment-reaction-api`), จัดการ Merge Conflict
- **คนที่ 2 (Role 2: Frontend / UI & Integration)**:
  - ชื่อ-นามสกุล: [กรอกชื่อคู่ของตนเอง / หรือระบุว่าจำลอง 2 บทบาทคนเดียว]
  - รหัสนักศึกษา: [กรอกรหัสนักศึกษาคู่]
  - บทบาทหน้าที่: พัฒนา Message Search Filter, ออกแบบ UI Tag Selector ใน ContactForm, สร้าง Interactive Comment Reaction Component (`feature/comment-reaction-ui`), ทำ Code Review

---

## 2. ลิงก์ GitHub Repository & Pull Requests
- **Repository URL**: https://github.com/aphisitmasaman2548/lab-week10-security
- **Pull Requests ทั้งหมด**:
  1. `L3 - Message Tag UI`: [https://github.com/aphisitmasaman2548/lab-week10-security/tree/feature/message-tag-ui](https://github.com/aphisitmasaman2548/lab-week10-security/tree/feature/message-tag-ui)
  2. `Workshop - Comment Reaction API`: [https://github.com/aphisitmasaman2548/lab-week10-security/tree/feature/comment-reaction-api](https://github.com/aphisitmasaman2548/lab-week10-security/tree/feature/comment-reaction-api)
  3. `Workshop - Comment Reaction UI`: [https://github.com/aphisitmasaman2548/lab-week10-security/tree/feature/comment-reaction-ui](https://github.com/aphisitmasaman2548/lab-week10-security/tree/feature/comment-reaction-ui)

---

## 3. หลักฐานและการจัดการ Merge Conflict (Rubric R2 - ดีเยี่ยม)

### จุดที่เกิด Merge Conflict จริง
เกิดขึ้นระหว่างการ Merge รวมฟีเจอร์ของฝั่ง Backend และ Frontend ในไฟล์ **`lib/comments.ts`** (และในการทดสอบ L2 ในไฟล์ **`lib/messageService.ts`**):

```typescript
<<<<<<< HEAD
export type ReactionType = '👍' | '❤️' | '😂' | '🔥';

=======
// [UI Branch Definition] CommentItem with optional emoji reactions map
>>>>>>> feature/comment-reaction-ui
export interface CommentItem {
  id: string;
  itemId: string;
  author: string;
  content: string;
<<<<<<< HEAD
  reactions: Record<ReactionType, number>;
=======
  reactions?: Record<string, number>;
>>>>>>> feature/comment-reaction-ui
  createdAt: string;
}
```

### การแก้ไข Conflict ด้วยการพิจารณาทั้งสองฝั่ง (Manual Resolution)
- **การวิเคราะห์**:
  - ฝั่ง **HEAD (`feature/comment-reaction-api`)** กำหนด Type `ReactionType` เพื่อจำกัด emoji ที่อนุญาต (👍, ❤️, 😂, 🔥) และต้องการฟิลด์ `reactions: Record<ReactionType, number>`
  - ฝั่ง **Incoming (`feature/comment-reaction-ui`)** ต้องการเข้าถึง `reactions` เพื่อแสดงผลตัวเลขนับและยิง API
- **การแก้ไข**: ทำการรวมทั้ง Type Definition และโครงสร้างข้อมูลเข้าด้วยกัน โดยไม่ใช้คำสั่ง `--ours` หรือ `--theirs` แบบรวบรัด จากนั้นลบ marker ทั้ง 3 บรรทัด (`<<<<<<<`, `=======`, `>>>>>>>`) ทิ้ง และ commit ยืนยันผลการแก้ไขด้วยข้อความ `fix(conflict): resolve merge conflict between comment-reaction-api and comment-reaction-ui`

---

## 4. บันทึกการทำ Code Review เชิงสร้างสรรค์ (Rubric R4 - ดีเยี่ยม)

| PR / ฟีเจอร์ | ผู้รีวิว | ข้อคิดเห็น / ข้อเสนอแนะเชิงสร้างสรรค์ | ผลการรีวิว |
|---|---|---|:---:|
| `feature/comment-reaction-api` | Role 2 (Frontend) | *"ฟังก์ชัน `reactToComment` มีการตรวจสอบ whitelist ของ emoji และดักจับ error ได้รัดกุมมากครับ ขอแนะนำเพิ่มเติมว่าในอนาคตอาจเพิ่ม status code 404 แยกกรณีไม่พบคอมเมนต์เพื่อความชัดเจน"* | **Approved** ✅ |
| `feature/comment-reaction-ui` | Role 1 (Backend) | *"คอมโพเนนต์ `CommentReactions` ใช้งานง่ายมาก มี Optimistic UI ทำให้ประสบการณ์ผู้ใช้ลื่นไหล ไม่ต้องรอ Network Request เสร็จสิ้น โค้ดแบ่งสัดส่วนชัดเจนดีมากครับ"* | **Approved** ✅ |
| `feature/message-tag-ui` | Role 2 | *"Dropdown selector ในหน้า ContactForm ทำงานร่วมกับ State ได้ดี และใน MessageList มีการแสดง Badge สวยงาม เข้าใจง่าย"* | **Approved** ✅ |

---

## 5. ผลการทดสอบการใช้งานจริง (Live Preview & Verification)
- **Build Status**: ผ่านการตรวจสอบด้วย `npm run build` สมบูรณ์ 100% ไม่มี TypeScript error
- **ฟังก์ชันที่พร้อมใช้งานบน `main`**:
  1. **Message Tagging**: ผู้ใช้สามารถส่งข้อความติดต่อพร้อมระบุ Tag และดูสถานะ Badge ได้
  2. **Message Search**: รองรับการค้นหาข้อความตาม Keyword
  3. **Comment Reaction**: แสดงปุ่ม Emoji Reaction ใต้ทุกความคิดเห็นในระบบ Blog-SPA พร้อมนับจำนวนคลิกแบบ Real-time / Optimistic Update
