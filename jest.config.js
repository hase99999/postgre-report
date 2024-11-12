module.exports = {
  setupFilesAfterEnv: ['./src/setupTests.js'],
  setupFiles: ['./src/setupTextEncoder.js'], // 追加
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ["js", "jsx"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(@mswjs|msw|@bundled-es-modules)/)"
  ],
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy"
  }
};