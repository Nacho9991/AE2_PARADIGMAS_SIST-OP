import {EstadodeProceso} from "./EstadodeProceso";

export interface IProcesoConsulta {
    getPid(): number;
    getEstado(): EstadodeProceso;
    getCpuTotal(): number;
    getMemoriaRequerida(): number;
    getCpuRestante(): number;
    getQuantumConsumido(): number;
    getBloqueoRestante(): number;
}