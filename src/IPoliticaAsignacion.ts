import { BloqueMemoria } from "./BloqueMemoria";

export interface IPoliticaAsignacion {
    seleccionar(bloques: ReadonlyArray<BloqueMemoria>, tamano: number): BloqueMemoria | undefined;
}