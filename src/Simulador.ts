export class Simulador {
    private readonly memoriaTotal: number;
    private readonly quantum: number;
    private tick: number;

    constructor(memoriaTotal: number, quantum: number){
        this.memoriaTotal = memoriaTotal;
        this.quantum = quantum;
        this.tick = 0;
    }
    getMemoriaTotal(): number {
        return this.memoriaTotal;
    }
    getQuantum(): number {
        return this.quantum
    }
    getTick(): number {
        return this.tick;
    }
    private setTick(nuevoTick: number): void{
        this.tick = nuevoTick;
    }
    
    esValido(): boolean {
        const memoriaValida = this.getMemoriaTotal() > 0 && this.getMemoriaTotal() % 1 === 0;
        const quantumValido = this.getQuantum() > 0 && this.getQuantum() % 1 === 0;
        return memoriaValida && quantumValido;
    }
}