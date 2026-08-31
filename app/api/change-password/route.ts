import bcrypt from 'bcrypt';
import { findUserById, updateUserPassword } from '@/lib/users';
import { changePasswordSchema } from '@/lib/schemas';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { cookies } from 'next/headers';
import { ZodError } from 'zod';

export const POST = withErrorHandling(async (request: Request) => {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('session')?.value;

  if (!sessionUserId) {
    throw new UnauthorizedError('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
  }

  const user = await findUserById(sessionUserId);
  if (!user) {
    throw new UnauthorizedError('ไม่พบข้อมูลบัญชีผู้ใช้ในระบบ');
  }

  let body;
  try {
    const raw = await request.json();
    body = changePasswordSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError(err.issues[0].message);
    }
    throw err;
  }

  const { oldPassword, newPassword } = body;

  const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordMatch) {
    throw new ValidationError('รหัสผ่านเดิมไม่ถูกต้อง');
  }

  await updateUserPassword(user.id, newPassword);

  return Response.json({
    ok: true,
    message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว',
  });
});
