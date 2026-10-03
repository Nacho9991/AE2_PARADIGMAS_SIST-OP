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


    asignar(pid: number, tamanioRequerido: number): boolean{
        let bloqueObjetivoIndex: number = -1; 

        this.getBloques().forEach((bloque, index) => {
            const esCandidato = bloque.estaLibre() && bloque.getTamanio() >= tamanioRequerido;
            bloqueObjetivoIndex === -1 && esCandidato && (bloqueObjetivoIndex = index);
        });

        const hayEspacio = bloqueObjetivoIndex !== -1

        hayEspacio && (() => {
        const bloque = this.getBloques()[bloqueObjetivoIndex];
        const inicio = bloque.getInicio();
        const tamanioBloque = bloque.getTamanio()
        const sobrante = tamanioBloque - tamanioRequerido;
        const bloqueOcupado = new BloqueMemoria(inicio, tamanioRequerido, pid);
        const reemplazo = sobrante > 0
         ? [bloqueOcupado, new BloqueMemoria(inicio + tamanioRequerido, sobrante)]
         : [bloqueOcupado];

        const nuevaLista = [
        ...this.getBloques().slice(0, bloqueObjetivoIndex),
        ...reemplazo,
        ...this.getBloques().slice(bloqueObjetivoIndex + 1),
            ];

            this.setBloques(nuevaLista);
        })()

        return hayEspacio
    }
}

