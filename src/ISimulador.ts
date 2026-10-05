import { EventoES } from "./EventoES";

export interface ISimulador {
    registrarProceso(pid: number, memoriaRequerida: number, cpuTotal: number, evento?: EventoES): void;
    tick(): void;
}