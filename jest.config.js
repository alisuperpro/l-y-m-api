/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    detectOpenHandles: true,
    testTimeout: 15000,
    forceExit: true,
}
