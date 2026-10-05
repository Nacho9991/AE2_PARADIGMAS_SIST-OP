import { BloqueMemoria } from "./BloqueMemoria";
import { IGestorMemoria } from "./IGestorMemoria";
import { IConsultaMemoria } from "./IConsultaMemoria"
import { IPoliticaAsignacion } from "./IPoliticaAsignacion"
import { FirstFit } from "./FirstFit"
export class GestorMemoria implements IGestorMemoria, IConsultaMemoria {
 private readonly memoriaTotal: number
    private bloques: BloqueMemoria[]
    private readonly estrategia: IPoliticaAsignacion

    constructor(memoriaTotal: number, estrategia: IPoliticaAsignacion = new FirstFit()) {
        this.memoriaTotal = memoriaTotal
        this.bloques = [new BloqueMemoria(0, memoriaTotal)]
        this.estrategia = estrategia
    }
    getMemoriaTotal(): number {
        return this.memoriaTotal;
    }
    getBloques(): ReadonlyArray<BloqueMemoria> { 
        return this.bloques
    }
    private setBloques(nuevosBloques: BloqueMemoria[]): void{
        this.bloques = nuevosBloques;
    }

//leer
    asignar(pid: number, tamanioRequerido: number): boolean{
        
        const bloqueElegido = this.estrategia.seleccionar(this.getBloques(), tamanioRequerido);
        const bloqueObjetivoIndex = bloqueElegido ? this.bloques.indexOf(bloqueElegido) : -1;
        const hayEspacio = bloqueObjetivoIndex !== -1;
        

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

    getMemoriaLibreTotal(): number {
        return this.bloques
            .filter((b) => b.estaLibre())
            .reduce((acc, b) => acc + b.getTamanio(), 0)
    }

    getMayorBloqueLibre(): number {
        const libres = this.bloques.filter((b) => b.estaLibre());
        return libres.reduce((max, b) => Math.max(max, b.getTamanio()), 0)
    }

    getMemoriaOcupada(): number {
        return this.getMemoriaTotal() - this.getMemoriaLibreTotal()
    }

    getFragmentacionExterna(): number {
        return this.getMemoriaLibreTotal() - this.getMayorBloqueLibre()
    }
}

