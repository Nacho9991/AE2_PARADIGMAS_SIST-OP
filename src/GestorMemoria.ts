import { BloqueMemoria } from"../src/BloqueMemoria";
import {IGestorMemoria} from "../IGestorMemoria"
export class GestorMemoria implements IGestorMemoria {
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

//leer
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
//leer
    liberar(pid: number): void {
        const bloquesActualizados = this.getBloques().map((b) =>
            b.getPidAsignado() === pid
                ? new BloqueMemoria(b.getInicio(), b.getTamanio())
                : b
        );

        const fusionados: BloqueMemoria[] = []

        for (const actual of bloquesActualizados) {
            const anterior = fusionados.length > 0 ? fusionados[fusionados.length - 1] : undefined;
            const sePuedenUnir = anterior !== undefined && anterior.estaLibre() && actual.estaLibre()

            sePuedenUnir && (
                fusionados[fusionados.length - 1] = new BloqueMemoria(
                    anterior.getInicio(),
                    anterior.getTamanio() + actual.getTamanio()
                )
            );

            !sePuedenUnir && fusionados.push(actual)
        }

        this.setBloques(fusionados)
    }
}

