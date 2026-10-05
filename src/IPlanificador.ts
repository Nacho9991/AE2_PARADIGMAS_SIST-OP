import { IProcesoControl } from "./IProcesoControl"

export interface IPlanificador {
    encolar(p: IProcesoControl): void
    actualizarBloqueados(): void
    despacharYEjecutar(): IProcesoControl | undefined
}