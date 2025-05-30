module.exports = {
  // setupFilesAfterEnv と setupFiles の行を削除または無効化
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