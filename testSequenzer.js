const Sequencer = require('@jest/test-sequencer').default

class CustomSequencer extends Sequencer {
    sort(tests) {
        // Define el orden deseado de tus archivos de test
        const testOrder = [
            './src/test/departments.test.ts', // Luego, tests de usuarios
            './src/test/roles.test.ts', // Después, tests de productos
            './src/test/employee.test.ts', // Primero, un test de configuración
        ]

        // Filtra los tests que están en tu orden deseado y luego añade los demás
        const orderedTests = testOrder
            .map((path) => tests.find((test) => test.path.includes(path)))
            .filter(Boolean) // Elimina cualquier `undefined` si un archivo no se encuentra

        // Añade cualquier otro test que no esté en la lista `testOrder`, ordenándolos alfabéticamente
        const remainingTests = tests
            .filter(
                (test) => !testOrder.some((path) => test.path.includes(path))
            )
            .sort((testA, testB) => (testA.path > testB.path ? 1 : -1))

        return [...orderedTests, ...remainingTests]
    }
}

module.exports = CustomSequencer
