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
    esValido(): boolean{
        const pidValido = this.pid > 0 && this.pid % 1 === 0;
        const memoriaValida = this.memoriaRequerida > 0 && this.memoriaRequerida % 1 === 0;
        const cpuValido = this.cpuTotal > 0 && this.cpuTotal % 1 === 0;
        return pidValido && memoriaValida && cpuValido;
    }
    
    private validarTransicion(nuevoEstado: EstadodeProceso): void{
        const noEstaTerminado = this.estado !== EstadodeProceso.Terminado;
        noEstaTerminado && (this.estado = nuevoEstado);
    }
    esperarMemoria():void{
        this.validarTransicion(EstadodeProceso.Esperando_Memoria);
    }
    admitir():void{
        this.validarTransicion(EstadodeProceso.Listo);
    }
    despachar():void{
        this.validarTransicion(EstadodeProceso.Ejecutando);
    }
    terminar():void{
        this.validarTransicion(EstadodeProceso.Terminado);
    }
}