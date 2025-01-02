import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// ログインルート
router.post('/login', login);

// ユーザー登録ルート（開発時のみ使用）
router.post('/register', register);

export default router;