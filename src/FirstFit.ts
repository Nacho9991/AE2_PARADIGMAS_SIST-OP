import { BloqueMemoria } from "./BloqueMemoria"
import { EstrategiaAsignacion } from "./EstrategiaAsignacion"

export class FirstFit extends EstrategiaAsignacion {
    protected elegir(candidatos: BloqueMemoria[]): BloqueMemoria | undefined {
        return candidatos[0]
    }
}