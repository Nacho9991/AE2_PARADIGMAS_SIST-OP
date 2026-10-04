export interface IGestorMemoria {
    asignar(pid: number, tamanio: number): boolean
    liberar(pid: number): void
}