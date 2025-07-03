export const generatePassword = (
    longitud = 12,
    incluirMayusculas = true,
    incluirNumeros = true,
    incluirSimbolos = true
) => {
    const caracteresMinusculas = 'abcdefghijklmnopqrstuvwxyz'
    const caracteresMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const caracteresNumeros = '0123456789'
    const caracteresSimbolos = '!@#$%^&*()_+[]{}|;:,.<>?'

    let caracteresDisponibles = caracteresMinusculas
    if (incluirMayusculas) caracteresDisponibles += caracteresMayusculas
    if (incluirNumeros) caracteresDisponibles += caracteresNumeros
    if (incluirSimbolos) caracteresDisponibles += caracteresSimbolos

    let password = ''
    for (let i = 0; i < longitud; i++) {
        const indiceAleatorio = Math.floor(
            Math.random() * caracteresDisponibles.length
        )
        password += caracteresDisponibles.charAt(indiceAleatorio)
    }

    return password
}
