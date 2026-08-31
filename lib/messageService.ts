import * as MessageModel from './messages';
import { NotFoundError, ValidationError, ForbiddenError } from './errors';
import { messageSchema, updateMessageSchema } from './schemas';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function createMessage(raw: unknown, authorId?: string | null) {
  let data;
  try {
    data = messageSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError(err.issues[0].message);
    throw err;
  }
  try {
    return await MessageModel.addMessage({ ...data, authorId });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ValidationError('อีเมลนี้ถูกใช้แล้ว');
    }
    throw err;
  }
}

// Retrieve all messages with optional search filter
export async function listMessages(search?: string) {
  const all = await MessageModel.getMessages();
  if (!search) return all;
  return all.filter((m) =>
    m.name.includes(search) ||
    m.message.includes(search)
  );
}

export async function getMessageById(id: string) {
  const item = await MessageModel.getMessageById(id);
  if (!item) {
    throw new NotFoundError('ไม่พบข้อความนี้');
  }
  return item;
}

export async function editMessage(id: string, updates: unknown, sessionUserId?: string) {
  const message = await getMessageById(id);
  if (message.authorId && message.authorId !== sessionUserId) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์แก้ไขข้อความนี้');
  }
  let validatedUpdates;
  try {
    validatedUpdates = updateMessageSchema.parse(updates);
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError(err.issues[0].message);
    throw err;
  }
  try {
    return await MessageModel.updateMessage(id, validatedUpdates);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }
}

export async function removeMessage(id: string, sessionUserId?: string) {
  const message = await getMessageById(id);
  if (message.authorId && message.authorId !== sessionUserId) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์ลบข้อความนี้');
  }
  try {
    return await MessageModel.deleteMessage(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }
}
