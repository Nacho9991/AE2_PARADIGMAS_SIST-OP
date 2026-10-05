import {BloqueMemoria} from "./BloqueMemoria"
import {GestorMemoria} from "./GestorMemoria"
import { EstadodeProceso } from "./EstadodeProceso"
import {Proceso} from "./Proceso";
import { EventoES } from "./EventoES";
import { Metricas } from "./Metricas"


export class Simulador {
    private readonly memoriaTotal: number;
    private readonly quantum: number;
    private tickActual: number;
    private gestorMemoria?: GestorMemoria;
    private procesos: Proceso[];
    private ticksCpuOcupada: number;
    private cambiosContexto: number
    private ultimoPidEnCpu?: number
    private metricas: Metricas


    constructor(memoriaTotal: number, quantum: number){
        this.memoriaTotal = memoriaTotal;
        this.quantum = quantum;
        this.tickActual = 0;
        this.ticksCpuOcupada = 0
        this.cambiosContexto = 0
        this.ultimoPidEnCpu = undefined
        this.procesos = [];

        const configuracionValida = this.esValido();
        configuracionValida && (this.gestorMemoria = new GestorMemoria(memoriaTotal))
        this.metricas = this.calcularMetricas()
    }
    getMemoriaTotal(): number {
        return this.memoriaTotal;
    }
    getQuantum(): number {
        return this.quantum
    }

    getCambiosContexto(): number {
        return this.cambiosContexto
    }

    getTicksCpuOcupada(): number {
        return this.ticksCpuOcupada
    }

    getUtilizacionCpu(): number {
        return this.tickActual === 0
            ? 0
            : (this.ticksCpuOcupada / this.tickActual) * 100
    }
    getTick(): number {
        return this.tickActual;
    }
    getTickActual(): number {
        return this.tickActual;
    }
    getGestorMemoria(): GestorMemoria | undefined{
        return this.gestorMemoria;
    }
    getProcesos(): ReadonlyArray<Proceso>{
        return this.procesos;
    }
    getMapaMemoria(): ReadonlyArray<BloqueMemoria> {
        const gestor = this.getGestorMemoria();
        return gestor ? gestor.getBloques() : []
    } 

    getMetricas(): Metricas {
        return this.metricas
    }

    private setTickActual(nuevoTick: number): void{
        this.tickActual = nuevoTick;
    }
    
    esValido(): boolean {
        const memoriaValida = this.getMemoriaTotal() > 0 && this.getMemoriaTotal() % 1 === 0;
        const quantumValido = this.getQuantum() > 0 && this.getQuantum() % 1 === 0;
        return memoriaValida && quantumValido;
    }

    private setProcesos(nuevoProcesos: Proceso[]): void{
        this.procesos = nuevoProcesos;
    }

    getProceso(pid: number): Proceso | undefined {
        let encontrado: Proceso | undefined = undefined;
        for (const p of this.getProcesos()) {
            p.getPid() === pid && (encontrado = p);
        }
        return encontrado
    }

    registrarProceso( pid: number, memoriaRequerida: number,cpuTotal: number,evento?: EventoES): void {
        const pidValido = pid > 0 && pid % 1 === 0
        const memoriaValida =
            memoriaRequerida > 0 &&
            memoriaRequerida % 1 === 0 &&
            memoriaRequerida <= this.getMemoriaTotal()
        const cpuValido = cpuTotal > 0 && cpuTotal % 1 === 0
        const yaExiste = this.getProceso(pid) !== undefined

        const esValido = pidValido && memoriaValida && cpuValido && !yaExiste
        esValido && this.procesos.push(new Proceso(pid, memoriaRequerida, cpuTotal, evento))
    }

    private admitirProcesos(): void {
        const gestor = this.getGestorMemoria()
        gestor && this.getProcesos()
            .filter((p) => p.getEstado() === EstadodeProceso.Nuevo)
            .forEach((p) => {
                const asignado = gestor.asignar(p.getPid(), p.getMemoriaRequerida());
                asignado && p.admitir()
            })
    }

    
    private despacharYEjecutar(): void {
        const enEjecucion = this.getProcesos().find(
            (p) => p.getEstado() === EstadodeProceso.Ejecutando
        );
        const siguienteListo = !enEjecucion
            ? this.getProcesos().find((p) => p.getEstado() === EstadodeProceso.Listo)
            : undefined

        siguienteListo && siguienteListo.despachar()
        const actual = enEjecucion || siguienteListo

        const esCambioContexto =
            actual !== undefined &&
            this.ultimoPidEnCpu !== undefined &&
            this.ultimoPidEnCpu !== actual.getPid()

        esCambioContexto && (this.cambiosContexto = this.cambiosContexto + 1)

        this.ultimoPidEnCpu = actual ? actual.getPid() : undefined

        actual && actual.ejecutar();
        actual && (this.ticksCpuOcupada = this.ticksCpuOcupada + 1)

        const termino = actual && actual.getCpuRestante() === 0
        const gestor = this.getGestorMemoria()

        termino && actual.terminar()
        termino && gestor && gestor.liberar(actual.getPid())

        const cpuEjecutado = actual ? actual.getCpuTotal() - actual.getCpuRestante() : 0
        const disparaES =
            !termino &&
            actual?.getEvento() !== undefined &&
            cpuEjecutado === actual.getEvento()?.getTicksCpuParaDisparo()

        disparaES && actual.bloquear()

        const agotoQuantum =
            !termino &&
            !disparaES &&
            actual &&
            actual.getQuantumConsumido() >= this.getQuantum()

        const hayOtroListo = this.getProcesos().some(
            (p) => p.getEstado() === EstadodeProceso.Listo && p.getPid() !== actual?.getPid()
        )

        agotoQuantum && hayOtroListo && actual.timeout()
        agotoQuantum &&
        hayOtroListo &&
            (this.procesos = [...this.procesos.filter((p) => p !== actual), actual])

        agotoQuantum && !hayOtroListo && actual.resetQuantum()
    }

    private actualizarBloqueados(): void {
    this.procesos
     .filter((p) => p.getEstado() === EstadodeProceso.Bloqueado)
     .forEach((p) => {
     p.decrementarBloqueo()
     p.getBloqueoRestante() === 0 && p.desbloquear()
     p.getEstado() === EstadodeProceso.Listo && (this.procesos = [ ...this.procesos.filter((otro) => otro !== p), p,])
     })
    }

    tick(): void {
        this.admitirProcesos();
        this.actualizarBloqueados();
        this.despacharYEjecutar();
        this.tickActual = this.tickActual + 1;
        this.metricas = this.calcularMetricas()
    }


    private calcularMetricas(): Metricas {
     const gestor = this.getGestorMemoria();
      return {
            memoriaLibreTotal: gestor ? gestor.getMemoriaLibreTotal() : 0,
            mayorBloqueLibre: gestor ? gestor.getMayorBloqueLibre() : 0,
            ocupacionMemoria: gestor ? gestor.getMemoriaOcupada() : 0,
            fragmentacionExterna: gestor ? gestor.getFragmentacionExterna() : 0,
            utilizacionCpu: this.getUtilizacionCpu(),
            cambiosContexto: this.getCambiosContexto()
        }
    }

    

}