import { axiosClient } from '../../../api';
import type { Estadisticas } from '../../../types/estadisticas';

// El backend decide el alcance según el rol del token: eventos propios (organizador) o toda la plataforma (admin)
export const obtenerEstadisticas = async (): Promise<Estadisticas> =>
    (await axiosClient.get<Estadisticas>('/estadisticas')).data;
