import {EstadodeProceso} from "./EstadodeProceso";
import {IProcesoConsulta} from "./IProcesoConsulta"
import{IProcesoControl} from "./IProcesoControl"
import{EventoES} from "./EventoES"
export class Proceso{
    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;
    private cpuRestante: number
    private quantumConsumido: number = 0
    private bloqueoRestante: number=0
    private estado?: EventoES

    constructor(pid:number, memoriaRequerida:number, cpuTotal: number, evento?: EventoES) {
        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.cpuTotal = cpuTotal;
        this.cpuRestante = cpuTotal
        this.quantumConsumido = 0
        this.bloqueoRestante = 0
        this.estado = EstadodeProceso.Nuevo
        this.evento = evento
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
    getEvento(): EventoES | undefined {
        return this.evento;
    }
    private setQuantumConsumido(valor: number): void {
        this.quantumConsumido = valor
    }

    resetQuantum(): void {
        this.quantumConsumido= 0 
    }

  timeout(): void {
    const puedeDesalojar = this.getEstado() === EstadodeProceso.Ejecutando
    puedeDesalojar && this.setEstado(EstadodeProceso.Listo)
    puedeDesalojar && this.resetQuantum()

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
        const puedeEsperar = this.getEstado() === EstadodeProceso.Nuevo
        puedeEsperar && this.setEstado(EstadodeProceso.Esperando_Memoria)
    }
    ejecutar(): void {
        const puedeEjecutar = this.cpuRestante > 0
        puedeEjecutar && (this.cpuRestante = this.cpuRestante - 1)
        puedeEjecutar && (this.quantumConsumido = this.quantumConsumido + 1)
    }
    admitir(): void {
        const puedeAdmitir = this.getEstado() === EstadodeProceso.Nuevo || 
        this.getEstado() === EstadodeProceso.Esperando_Memoria;
        puedeAdmitir && this.setEstado(EstadodeProceso.Listo);
    }
    despachar(): void {
        const puedeDespachar = this.getEstado() === EstadodeProceso.Listo;
        puedeDespachar && this.setEstado(EstadodeProceso.Ejecutando)
    }
    bloquear(): void {
        const puedeBloquear = this.getEstado() === EstadodeProceso.Ejecutando
        puedeBloquear && this.evento && (this.bloqueoRestante = this.evento.getDuracion())
        puedeBloquear && this.setEstado(EstadodeProceso.Bloqueado)
        puedeBloquear && this.resetQuantum()
    }
    terminar(): void {
        const puedeTerminar = this.getEstado() === EstadodeProceso.Ejecutando
        puedeTerminar && this.setEstado(EstadodeProceso.Terminado)

        
}}