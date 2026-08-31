import { z } from 'zod';

export const messageSchema = z.object({
  name: z.string().min(2, 'ชื่อสั้นเกินไป').max(100),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  message: z.string().min(5, 'ข้อความสั้นเกินไป').max(1000),
});

export const updateMessageSchema = z.object({
  name: z.string().min(2, 'ชื่อสั้นเกินไป').max(100).optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional(),
  message: z.string().min(5, 'ข้อความสั้นเกินไป').max(1000).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านเดิม'),
  newPassword: z.string().min(8, 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
});

export const commentSchema = z.object({
  itemId: z.string().min(1, 'ต้องระบุ itemId'),
  author: z.string().min(1, 'ต้องระบุชื่อผู้เขียน'),
  content: z.string().min(1, 'เนื้อหาคอมเมนต์ห้ามว่าง').max(1000),
});
