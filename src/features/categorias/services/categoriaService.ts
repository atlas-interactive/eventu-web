import { axiosClient } from '../../../api';
import type { Categoria, CategoriaSolicitud } from '../../../types/categoria';

// El administrador se identifica con el token JWT (el interceptor de axios lo envía en Authorization),
// por eso ninguna llamada necesita el id del usuario.

// soloActivas=true es lo que usa el selector de "Crear evento" (HU-05)
export const listarCategorias = async (soloActivas = false): Promise<Categoria[]> => {
    const { data } = await axiosClient.get<Categoria[]>('/categorias', { params: { soloActivas } });
    // Si VITE_API_URL apunta mal, el servidor de Vite responde 200 con HTML: se corta aquí en vez de romper la pantalla
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /categorias no es una lista. Revisa VITE_API_URL.');
    }
    return data;
};

export const crearCategoria = async (data: CategoriaSolicitud): Promise<Categoria> =>
    (await axiosClient.post<Categoria>('/categorias', data)).data;

export const editarCategoria = async (id: number, data: CategoriaSolicitud): Promise<Categoria> =>
    (await axiosClient.put<Categoria>(`/categorias/${id}`, data)).data;

// Desactivar no elimina: los eventos que ya usan la categoría la conservan. Solo necesitan el id, sin cuerpo
export const desactivarCategoria = async (id: number): Promise<Categoria> =>
    (await axiosClient.patch<Categoria>(`/categorias/${id}/desactivar`)).data;

export const activarCategoria = async (id: number): Promise<Categoria> =>
    (await axiosClient.patch<Categoria>(`/categorias/${id}/activar`)).data;