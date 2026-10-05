export interface IPlanificadorConsulta {
    getEnCpu(): number | undefined
    getListos(): ReadonlyArray<number>
    getBloqueados(): ReadonlyArray<number>
    getCambiosContexto(): number
    getTicksCpuOcupada(): number
}