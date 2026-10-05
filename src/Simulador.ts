import { BloqueMemoria } from "./BloqueMemoria";
import { GestorMemoria } from "./GestorMemoria";
import { EstadodeProceso } from "./EstadodeProceso";
import { Proceso } from "./Proceso";
import { EventoES } from "./EventoES";
import { Metricas } from "./Metricas";
import { IEstadoSistema } from "./IEstadoSistema";
import { PlanificadorRoundRobin } from "./PlanificadorRoundRobin";
import { ISimulador } from "./ISimulador";
import { ISimuladorConsulta } from "./ISimuladorConsulta";

export class Simulador implements ISimulador, ISimuladorConsulta {
    private readonly memoriaTotal: number;
    private readonly quantum: number;
    private tickActual: number = 0;
    private gestorMemoria?: GestorMemoria;
    private planificador?: PlanificadorRoundRobin;
    private procesos: Proceso[] = [];

    constructor(memoriaTotal: number, quantum: number) {
        this.memoriaTotal = memoriaTotal;
        this.quantum = quantum;
        this.tickActual = 0;
        this.procesos = [];

        const configuracionValida = this.esValido();
        configuracionValida && (this.gestorMemoria = new GestorMemoria(memoriaTotal));
        configuracionValida && (this.planificador = new PlanificadorRoundRobin(quantum));
    }

    getMemoriaTotal(): number {
        return this.memoriaTotal;
    }

    getQuantum(): number {
        return this.quantum;
    }

    getTick(): number {
        return this.tickActual;
    }

    getTickActual(): number {
        return this.tickActual;
    }

    getGestorMemoria(): GestorMemoria | undefined {
        return this.gestorMemoria;
    }

    getProcesos(): ReadonlyArray<Proceso> {
        const listosPids = this.planificador ? this.planificador.getListos() : [];

        return [...this.procesos].sort((a, b) => {
            const idxA = listosPids.indexOf(a.getPid());
            const idxB = listosPids.indexOf(b.getPid());
            return idxA !== -1 && idxB !== -1 ? idxA - idxB : 0;
        });
    }

    getMapaMemoria(): ReadonlyArray<BloqueMemoria> {
        const gestor = this.getGestorMemoria();
        return gestor ? gestor.getBloques() : [];
    }

    getProceso(pid: number): Proceso | undefined {
        return this.procesos.find((p) => p.getPid() === pid);
    }

    getProcesoEnCpu(): number | undefined {
        return this.planificador?.getEnCpu();
    }

    getColaListos(): ReadonlyArray<number> {
        return this.planificador ? this.planificador.getListos() : [];
    }

    getEsperandoMemoria(): ReadonlyArray<number> {
        return this.getProcesos()
            .filter((p) => p.getEstado() === EstadodeProceso.Esperando_Memoria)
            .map((p) => p.getPid());
    }

    getBloqueados(): ReadonlyArray<number> {
        return this.planificador ? this.planificador.getBloqueados() : [];
    }

    getTerminados(): ReadonlyArray<number> {
        return this.getProcesos()
            .filter((p) => p.getEstado() === EstadodeProceso.Terminado)
            .map((p) => p.getPid());
    }

    esValido(): boolean {
        const memoriaValida = this.getMemoriaTotal() > 0 && this.getMemoriaTotal() % 1 === 0;
        const quantumValido = this.getQuantum() > 0 && this.getQuantum() % 1 === 0;
        return memoriaValida && quantumValido;
    }


    getCambiosContexto(): number {
        return this.planificador ? this.planificador.getCambiosContexto() : 0;
    }

    getTicksCpuOcupada(): number {
        return this.planificador ? this.planificador.getTicksCpuOcupada() : 0;
    }

    getUtilizacionCpu(): number {
        const ocupada = this.getTicksCpuOcupada();
        return this.tickActual === 0
            ? 0
            : Math.round((ocupada / this.tickActual) * 100);
    }

    getMetricas(): Metricas {
        return this.calcularMetricas();
    }

    private calcularMetricas(): Metricas {
        const gestor = this.getGestorMemoria();
        return {
            memoriaLibreTotal: gestor?.getMemoriaLibreTotal() ?? 0,
            mayorBloqueLibre: gestor?.getMayorBloqueLibre() ?? 0,
            ocupacionMemoria: gestor?.getMemoriaOcupada() ?? 0,
            fragmentacionExterna: gestor?.getFragmentacionExterna() ?? 0,
            utilizacionCpu: this.getUtilizacionCpu(),
            cambiosContexto: this.getCambiosContexto(),
        };
    }

    registrarProceso(pid: number, memoriaRequerida: number, cpuTotal: number, evento?: EventoES): void {
        const pidValido = pid > 0 && pid % 1 === 0;
        const memoriaValida =
            memoriaRequerida > 0 &&
            memoriaRequerida % 1 === 0 &&
            memoriaRequerida <= this.getMemoriaTotal();
        const cpuValido = cpuTotal > 0 && cpuTotal % 1 === 0;
        const yaExiste = this.getProceso(pid) !== undefined;

        const esValido = pidValido && memoriaValida && cpuValido && !yaExiste;
        esValido && this.procesos.push(new Proceso(pid, memoriaRequerida, cpuTotal, evento));
    }

    tick(): void {
        this.admitirProcesos();
        this.actualizarBloqueados();
        this.despacharYEjecutar();
        this.tickActual = this.tickActual + 1;
    }

    private admitirProcesos(): void {
        const gestor = this.gestorMemoria;
        gestor &&
            this.getProcesos()
                .filter((p) => p.getEstado() === EstadodeProceso.Nuevo || p.getEstado() === EstadodeProceso.Esperando_Memoria )
                .forEach((p) => {
                    const asignado = gestor.asignar(p.getPid(), p.getMemoriaRequerida());
                    asignado && (() => {p.admitir();this.planificador?.encolar(p);})();
                    !asignado && p.esperarMemoria();
                });
    }

    private actualizarBloqueados(): void {
        this.planificador?.actualizarBloqueados();
    }

    private despacharYEjecutar(): void {
        const terminado = this.planificador?.despacharYEjecutar() as Proceso | undefined;
        terminado && this.gestorMemoria?.liberar(terminado.getPid());
    }

    getEstadoSistema(): IEstadoSistema {
        return {
            tick: this.getTickActual(),
            cpu: this.getProcesoEnCpu(),
            listos: [...this.getColaListos()],
            esperandoMemoria: [...this.getEsperandoMemoria()],
            bloqueados: [...this.getBloqueados()],
            terminados: [...this.getTerminados()],
            mapaMemoria: [...this.getMapaMemoria()],
        }
    }

    getCantidadProcesosPorEstado(estado: EstadodeProceso): number {
        const filtrados = this.procesos.filter((p) => p.getEstado() === estado);
        return filtrados.length;
    }
}