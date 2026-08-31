import bcrypt from 'bcrypt';
import { findUserByEmail } from '@/lib/users';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  return Response.json({ isLoggedIn: !!session });
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await findUserByEmail(email);

    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      return Response.json({ error: 'อีเมล/รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('session', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('Login error:', err);
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
