import {EstadodeProceso} from "./EstadodeProceso";
import {IProcesoConsulta} from "./IProcesoConsulta"
import{IProcesoControl} from "./IProcesoControl"
export class Proceso{
    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;
    private cpuRestante: number
    private quantumConsumido: number
    private bloqueoRestante: number
    private estado: EstadodeProceso

    constructor(pid:number, memoriaRequerida:number, cpuTotal: number) {
        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.cpuTotal = cpuTotal;
        this.cpuRestante = cpuTotal
        this.quantumConsumido = 0
        this.bloqueoRestante = 0
        this.estado = EstadodeProceso.Nuevo;
    }

    getPid(): number {
    return this.pid;
    }
    getMemoriaRequerida(): number {
    return this.memoriaRequerida;
    }
    getCpuTotal(): number {
    return this.cpuTotal;
    }
    getEstado(): EstadodeProceso {
    return this.estado;
    }
    getCpuRestante(): number {
    return this.cpuRestante;
    }
    getQuantumConsumido(): number {
    return this.quantumConsumido;
    }
    getBloqueoRestante(): number {
    return this.bloqueoRestante;
    }
    private setEstado(nuevoEstado: EstadodeProceso): void {
        this.estado = nuevoEstado;
    }


    esValido(): boolean {
        const pidValido = this.getPid() > 0 && this.getPid() % 1 === 0;
        const memoriaValida = this.getMemoriaRequerida() > 0 && this.getMemoriaRequerida() % 1 === 0;
        const cpuValido = this.getCpuTotal() > 0 && this.getCpuTotal() % 1 === 0;
        return pidValido && memoriaValida && cpuValido;
    }
    
    esperarMemoria(): void {
        const puedeEsperar = this.getEstado() === EstadodeProceso.Nuevo;
        puedeEsperar && this.setEstado(EstadodeProceso.Esperando_Memoria);
    }
    ejecutar(): void {
        this.cpuRestante > 0 && (this.cpuRestante = this.cpuRestante - 1);
    }
    admitir(): void {
        const puedeAdmitir = this.getEstado() === EstadodeProceso.Nuevo || 
        this.getEstado() === EstadodeProceso.Esperando_Memoria;
        puedeAdmitir && this.setEstado(EstadodeProceso.Listo);
    }
    despachar(): void {
        const puedeDespachar = this.getEstado() === EstadodeProceso.Listo;
        puedeDespachar && this.setEstado(EstadodeProceso.Ejecutando);
    }
    terminar(): void {
        const puedeTerminar = this.getEstado() === EstadodeProceso.Ejecutando;
        puedeTerminar && this.setEstado(EstadodeProceso.Terminado);
}

}