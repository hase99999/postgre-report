import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 環境変数からJWTシークレットキーを取得
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET が設定されていません。');
  process.exit(1);
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Authorizationヘッダーが存在するか確認
  if (!authHeader) {
    console.error('Authorization headerが欠如しています。');
    return res.status(401).json({ error: 'Authorization headerが欠如しています。' });
  }

  const token = authHeader.split(' ')[1]; // 'Bearer token' の形式を期待

  if (!token) {
    console.error('トークンが提供されていません。');
    return res.status(401).json({ error: 'トークンが提供されていません。' });
  }

  try {
    console.log('受信したトークン:', token);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('デコードされたトークン:', decoded);

    const doctor = await prisma.doctor.findUnique({
      where: { docid: decoded.docid },
    });

    if (!doctor) {
      console.error('無効なトークンです。');
      return res.status(401).json({ error: '無効なトークンです。' });
    }

    req.user = doctor; // リクエストオブジェクトにユーザー情報を追加
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    return res.status(403).json({ error: 'トークンの検証に失敗しました。' });
  }
};

export default authMiddleware;