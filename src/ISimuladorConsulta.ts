import { BloqueMemoria } from "./BloqueMemoria";
import { IProcesoConsulta } from "./IProcesoConsulta";
import { Metricas } from "./Metricas";

export interface ISimuladorConsulta {
    getTick(): number;
    getMetricas(): Metricas;
    getProceso(pid: number): IProcesoConsulta | undefined;
    getProcesos(): ReadonlyArray<IProcesoConsulta>;
    getProcesoEnCpu(): number | undefined;
    getColaListos(): ReadonlyArray<number>;
    getEsperandoMemoria(): ReadonlyArray<number>;
    getBloqueados(): ReadonlyArray<number>;
    getTerminados(): ReadonlyArray<number>;
    getMapaMemoria(): ReadonlyArray<BloqueMemoria>;
}