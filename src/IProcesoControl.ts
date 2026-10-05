export interface IProcesoControl {
    admitir(): void;
    esperarMemoria(): void;
    despachar(): void;
    ejecutarTick(): void;
    bloquear(): void;
    avanzarBloqueo(): void;
    expulsar(): void
    terminar(): void;
}