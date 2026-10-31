import { isAxiosError } from 'axios';

// Con responseType 'blob' el cuerpo de un error también llega como Blob; se lee como JSON para que mensajeDeError encuentre {"error": "..."}
export const convertirErrorBlob = async (err: unknown): Promise<unknown> => {
    if (isAxiosError(err) && err.response?.data instanceof Blob) {
        try {
            err.response.data = JSON.parse(await err.response.data.text());
        } catch {
            // El cuerpo no era JSON: el error se deja como llegó
        }
    }
    return err;
};

// Guarda el archivo en el equipo del usuario mediante un enlace temporal
export const guardarArchivo = (contenido: Blob, nombre: string) => {
    const url = URL.createObjectURL(contenido);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
};
