import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameを取得（ESモジュールでは直接使用できないため）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ログディレクトリへのパス
const logDir = path.join(__dirname, '../logs');

// ロガー設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'postgre-sql-backend' },
  transports: [
    // エラーレベルのみをerror.logファイルに書き込む
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // すべてのログをserver.logファイルに書き込む
    new winston.transports.File({ 
      filename: path.join(logDir, 'server.log') 
    })
  ]
});

// 開発環境では、コンソールにもログを出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// console.logなどの標準出力をロガーに置き換える
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args) => {
  originalConsoleLog(...args);
  logger.info(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' '));
};

console.error = (...args) => {
  originalConsoleError(...args);
  logger.error(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' '));
};

console.warn = (...args) => {
  originalConsoleWarn(...args);
  logger.warn(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' '));
};

console.info = (...args) => {
  originalConsoleInfo(...args);
  logger.info(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' '));
};

export default logger;