export class BloqueMemoria{
    private readonly inicio: number;
    private readonly tamanio: number;
    private pidAsignado?: number //significa que esa propiedad y parametro son opcionales


    constructor(inicio:number, tamanio:number, pidAsignado?: number) {
        this.inicio = inicio;
        this.tamanio = tamanio;
        this.pidAsignado = pidAsignado;
        
    }

    getInicio(): number {
    return this.inicio;
    }
    getTamanio(): number {
    return this.tamanio;
    }
    getPidAsignado(): number| undefined { //el | funciona como un O.
    return this.pidAsignado;
    }

    estaLibre(): boolean{
        return this.getPidAsignado() === undefined;
    }
}