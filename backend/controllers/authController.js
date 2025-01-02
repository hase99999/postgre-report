import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 環境変数からJWTシークレットキーを取得
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ログインハンドラー
export const login = async (req, res) => {
  const { employeeNumber, password } = req.body;

  // 従業員番号とパスワードが提供されているか確認
  if (!employeeNumber || !password) {
    return res.status(400).json({ error: '従業員番号とパスワードが必要です。' });
  }

  try {
    // employeeNumber で Doctor を検索
    const doctor = await prisma.doctor.findUnique({
      where: { employeeNumber },
    });

    // Doctorが存在しない場合
    if (!doctor) {
      return res.status(401).json({ error: '従業員番号またはパスワードが間違っています。' });
    }

    // パスワードの検証（ハッシュ化されている場合）
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '従業員番号またはパスワードが間違っています。' });
    }

    // トークンの生成
    const token = jwt.sign(
      { docid: doctor.docid, employeeNumber: doctor.employeeNumber },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // レスポンスにトークンとDoctor情報を返す
    res.json({
      token,
      doctor: {
        docid: doctor.docid,
        employeeNumber: doctor.employeeNumber,
        docname: doctor.docname,
        email: doctor.email,
        department: doctor.department,
        hospital: doctor.hospital,
        level: doctor.level,
      },
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
};

// ユーザー登録ハンドラー（開発時のみ使用）
export const register = async (req, res) => {
  const { employeeNumber, docname, email, password, department, hospital, level } = req.body;

  try {
    // employeeNumber または email で既存の Doctor を確認
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { employeeNumber },
          { email },
        ],
      },
    });

    if (existingDoctor) {
      return res.status(400).json({ error: '従業員番号またはメールが既に存在します。' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規 Doctor の作成
    const newDoctor = await prisma.doctor.create({
      data: {
        employeeNumber,
        docname,
        email,
        password: hashedPassword,
        department,
        hospital,
        level,
      },
    });

    res.status(201).json({
      message: 'Doctorが登録されました。',
      doctor: {
        docid: newDoctor.docid,
        employeeNumber: newDoctor.employeeNumber,
        docname: newDoctor.docname,
        email: newDoctor.email,
        department: newDoctor.department,
        hospital: newDoctor.hospital,
        level: newDoctor.level,
      },
    });
  } catch (error) {
    console.error('Doctor登録エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
};