import bcrypt from 'bcrypt';

const password = '123123123'; // ハッシュ化したいパスワード
const saltRounds = 10; // ソルトの複雑さ (推奨値: 10-12)

async function hashPassword() {
  try {
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('ハッシュ化されたパスワード:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('ハッシュ化中にエラーが発生しました:', error);
  }
}

hashPassword();