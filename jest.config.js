module.exports = {
    projects: [
        { displayName: "test", preset: "ts-jest", testEnvironment: "node"  },
        { displayName: "lint", runner: "jest-runner-eslint", testMatch: ["<rootDir>/src/**/*.ts"] },
    ],
}
