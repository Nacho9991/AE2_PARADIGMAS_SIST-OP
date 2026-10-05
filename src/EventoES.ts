export class EventoES  {
private ticksCpuParaDisparo: number
private duracion: number

constructor(ticksCpuParaDisparo: number, duracion: number) {
    this.ticksCpuParaDisparo = ticksCpuParaDisparo
    this.duracion=duracion
}
getTicksCpuParaDisparo(): number{
    return this.ticksCpuParaDisparo
}
getDuracion(): number{
    return this.duracion
}
}