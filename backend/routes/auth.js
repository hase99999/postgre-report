const express = require('express');
const router = express.Router();
const { authenticate, generateToken } = require('../controllers/authController');

// ログインルート
router.post('/login', async (req, res) => {
  const { employeeNumber, password } = req.body;
  
  try {
    // 認証ロジック
    const user = await authenticate(employeeNumber, password);
    
    if (user) {
      const token = generateToken(user); // JWTトークン生成
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          // 必要なユーザー情報を追加
        }
      });
    } else {
      res.status(401).json({ error: '認証に失敗しました。' });
    }
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;