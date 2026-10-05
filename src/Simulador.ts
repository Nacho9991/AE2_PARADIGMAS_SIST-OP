import {BloqueMemoria} from "./BloqueMemoria"
import {GestorMemoria} from "./GestorMemoria"
import { EstadodeProceso } from "./EstadodeProceso"
import {Proceso} from "./Proceso";


export class Simulador {
    private readonly memoriaTotal: number;
    private readonly quantum: number;
    private tickActual: number;
    private gestorMemoria?: GestorMemoria;
    private procesos: Proceso[];

    constructor(memoriaTotal: number, quantum: number){
        this.memoriaTotal = memoriaTotal;
        this.quantum = quantum;
        this.tickActual = 0;
        this.procesos = [];

        const configuracionValida = this.esValido();
        configuracionValida && (this.gestorMemoria = new GestorMemoria(memoriaTotal))
    }
    getMemoriaTotal(): number {
        return this.memoriaTotal;
    }
    getQuantum(): number {
        return this.quantum
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

    registrarProceso(pid: number, memoria: number, cpu: number): void {
        const pidValido = pid > 0 && pid % 1 === 0;
        const memoriaValida = memoria > 0 && memoria % 1 === 0 && memoria <= this.getMemoriaTotal();
        const cpuValido = cpu > 0 && cpu % 1 === 0;

        const yaExiste = this.getProceso(pid) !== undefined;
        const esAdmisible = pidValido && memoriaValida && cpuValido && !yaExiste;

        esAdmisible && this.setProcesos([...this.getProcesos(), new Proceso(pid, memoria, cpu)]);
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
        )
        const siguienteListo = !enEjecucion
            ? this.getProcesos().find((p) => p.getEstado() === EstadodeProceso.Listo)
            : undefined
        siguienteListo && siguienteListo.despachar()
        const actual = enEjecucion || siguienteListo
        actual && actual.ejecutar()

        const termino = actual && actual.getCpuRestante() === 0
        const gestor = this.getGestorMemoria()
        termino && actual.terminar()
        termino && gestor && gestor.liberar(actual.getPid())
    }

    tick(): void {
        this.admitirProcesos();
        this.setTickActual(this.getTickActual() + 1)
        this.despacharYEjecutar()
    }

    

}