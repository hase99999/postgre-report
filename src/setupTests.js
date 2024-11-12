import { server } from './mocks/server';
import './setupTextEncoder'; // 追加

// テストの前にサーバーを起動
beforeAll(() => server.listen());

// 各テストの後にリクエストハンドラをリセット
afterEach(() => server.resetHandlers());

// テストの後にサーバーを閉じる
afterAll(() => server.close());