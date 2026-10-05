import { BloqueMemoria } from "./BloqueMemoria"
import { IPoliticaAsignacion } from "./IPoliticaAsignacion"

export abstract class EstrategiaAsignacion implements IPoliticaAsignacion {
    seleccionar(bloques: ReadonlyArray<BloqueMemoria>, tamano: number): BloqueMemoria | undefined {
        const candidatos = bloques.filter((b) => b.estaLibre() && b.getTamanio() >= tamano)
        return this.elegir(candidatos)
    }

    protected abstract elegir(candidatos: BloqueMemoria[]): BloqueMemoria | undefined
}