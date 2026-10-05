import {BloqueMemoria} from "./BloqueMemoria"
export interface IEstadoSistema{
    tick: number
    cpu: number | undefined
    listos: ReadonlyArray<number>
    esperandoMemoria: ReadonlyArray<number>
    bloqueados: ReadonlyArray<number>
    terminados: ReadonlyArray<number>
    mapaMemoria: ReadonlyArray<BloqueMemoria>
}