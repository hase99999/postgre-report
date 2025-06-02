import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // リセットするユーザーのemployeeNumber
    const employeeNumber = '46086'; // 変更したいユーザーのID
    
    // 新しいパスワード
    const newPassword = '123123123'; // リセット後のパスワード
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // パスワードを更新
    const result = await prisma.doctor.update({
      where: { employeeNumber },
      data: { password: hashedPassword },
    });
    
    console.log(`${result.docname}のパスワードを「${newPassword}」にリセットしました`);
  } catch (error) {
    console.error('パスワードリセット中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();