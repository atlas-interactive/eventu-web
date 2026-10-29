export const validarCorreoInstitucional = (correo: string): boolean => {
    const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@unillanos\.edu\.co$/;
    return correo.length > 0 && correoInstitucionalRegex.test(correo);
}

export const validarLongitudContrasena = (password: string): boolean => {
    return password.length >= 8 && password.length <= 72;
}