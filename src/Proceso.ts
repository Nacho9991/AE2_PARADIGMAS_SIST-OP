export class Proceso{
    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;

    constructor(pid:number, memoriaRequerida:number, cpuTotal: number) {
        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.cpuTotal = cpuTotal;
    }
    
    getPid(): number {
        return this.pid;
    }

    getMemoriaRequerida(): number {
        return this.memoriaRequerida;
    }

    getCpuTotal(): number {
        return this.cpuTotal;
    }
    
    esValido(): boolean{
        const pidValido = this.pid > 0 && this.pid % 1 === 0;
        const memoriaValida = this.memoriaRequerida > 0 && this.memoriaRequerida % 1 === 0;
        const cpuValido = this.cpuTotal > 0 && this.cpuTotal % 1 === 0;
        return pidValido && memoriaValida && cpuValido;
    }
    
}