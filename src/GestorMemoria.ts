import { BloqueMemoria } from"../src/BloqueMemoria";
export class GestorMemoria {
    private readonly memoriaTotal: number;
    private bloques: BloqueMemoria[];

    constructor(memoriaTotal: number){
        this.memoriaTotal = memoriaTotal;
        this.bloques = [new BloqueMemoria(0, memoriaTotal)];
    }
    getMemoriaTotal(): number {
        return this.memoriaTotal;
    }
    getBloques(): ReadonlyArray<BloqueMemoria> { //deja mirar los bloques de memoria y recorrerlos, pero bajo ninguna circunstancia puedes alterar, agregar o quitar elementos de esta lista
        return this.bloques
    }
    private setBloques(nuevosBloques: BloqueMemoria[]): void{
        this.bloques = nuevosBloques;
    }
}