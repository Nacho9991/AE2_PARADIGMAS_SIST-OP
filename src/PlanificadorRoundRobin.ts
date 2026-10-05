import { IPlanificador } from "./IPlanificador"
import { IPlanificadorConsulta } from "./IPlanificadorConsulta"
import { IProcesoControl } from "./IProcesoControl"
import { IProcesoConsulta } from "./IProcesoConsulta"

type ProcesoEnPlanificador = IProcesoControl & IProcesoConsulta & {
    desbloquear?(): void
    resetQuantum?(): void
    getEvento?(): { getTicksCpuParaDisparo(): number; getDuracion(): number } | undefined
};

export class PlanificadorRoundRobin implements IPlanificador, IPlanificadorConsulta {
    private readonly quantum: number
    private colaListos: ProcesoEnPlanificador[] = []
    private bloqueados: ProcesoEnPlanificador[] = []
    private enCpu?: ProcesoEnPlanificador
    private cambiosContexto: number = 0
    private ticksCpuOcupada: number = 0
    private ultimoPidEnCpu?: number

    constructor(quantum: number) {
        this.quantum = quantum
    }


    encolar(p: IProcesoControl): void {
        this.colaListos.push(p as ProcesoEnPlanificador)
    }

    actualizarBloqueados(): void {
        this.bloqueados.forEach((p) => p.avanzarBloqueo())
        const desbloqueados = this.bloqueados.filter((p) => p.getBloqueoRestante() === 0)
        const siguenBloqueados = this.bloqueados.filter((p) => p.getBloqueoRestante() > 0)

        desbloqueados.forEach((p) => p.desbloquear?.())
        this.bloqueados = siguenBloqueados
        this.colaListos = [...this.colaListos, ...desbloqueados]
    }

    despacharYEjecutar(): IProcesoControl | undefined {
  
        const debeDespachar = !this.enCpu && this.colaListos.length > 0
        debeDespachar && (() => {
            this.enCpu = this.colaListos.shift()
            this.enCpu?.despachar()
        })()

        const actual = this.enCpu

        actual && (() => {
            const actualPid = actual.getPid()
            const esCambioContexto =
                this.ultimoPidEnCpu !== undefined && this.ultimoPidEnCpu !== actualPid

            esCambioContexto && (this.cambiosContexto += 1)
            this.ultimoPidEnCpu = actualPid

            actual.ejecutarTick();
            this.ticksCpuOcupada += 1
        })()

        // 3. Evaluar fin de proceso
        const termino = actual !== undefined && actual.getCpuRestante() === 0
        termino && (() => {
            actual.terminar()
            this.enCpu = undefined
        })()

        const cpuEjecutado = actual ? actual.getCpuTotal() - actual.getCpuRestante() : 0
        const evento = actual?.getEvento?.()
        const disparaES =
            !termino &&
            actual !== undefined &&
            evento !== undefined &&
            cpuEjecutado === evento.getTicksCpuParaDisparo()

        disparaES && (() => {
            actual.bloquear()
            this.bloqueados.push(actual)
            this.enCpu = undefined
        })()

        const agotoQuantum =
            !termino &&
            !disparaES &&
            actual !== undefined &&
            actual.getQuantumConsumido() >= this.quantum

        const hayOtroListo = this.colaListos.length > 0

        agotoQuantum && hayOtroListo && (() => {
            actual.expulsar()
            this.colaListos.push(actual)
            this.enCpu = undefined
        })()

        agotoQuantum && !hayOtroListo && actual?.resetQuantum?.()

        return termino ? actual : undefined
    }

    getEnCpu(): number | undefined {
        return this.enCpu ? this.enCpu.getPid() : undefined
    }

    getListos(): ReadonlyArray<number> {
        return this.colaListos.map((p) => p.getPid())
    }

    getBloqueados(): ReadonlyArray<number> {
        return this.bloqueados.map((p) => p.getPid())
    }

    getCambiosContexto(): number {
        return this.cambiosContexto
    }

    getTicksCpuOcupada(): number {
        return this.ticksCpuOcupada
    }
}