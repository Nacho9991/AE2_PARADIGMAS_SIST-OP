import { describe, test, expect} from "vitest"
import { Proceso } from "../src/Proceso"
import {EstadodeProceso} from "../src/EstadodeProceso"
import {EventoES} from "../src/EventoES"

describe("Proceso", () => {
    test("verifica el PID, la memoria requerida y el tiempo total de cpu", () => {
        const p = new Proceso(1, 200,5);
        expect(p.getPid()).toBe(1);
        expect(p.getMemoriaRequerida()).toBe(200)
        expect(p.getCpuTotal()).toBe(5)                           
    });
    test("si hago proceso con datos correctos es valido",()=>{
        const p=new Proceso(1, 200, 5);
        expect(p.esValido()).toBe(true);
    });
});


describe("estado inicial", () => {
    test("Un proceso recien creado debe estar en estado nuevo",()=>{
        const p=new Proceso(1, 200, 5)
        expect(p.getEstado()).toBe(EstadodeProceso.Nuevo)
    })
    test("Un proceso recien creado tiene todo su cpu pendiente",()=>{
        const p=new Proceso(1, 200, 5)
        expect(p.getCpuRestante()).toBe(5)
    })
    test("Un proceso recien creado tiene el quantum consumido en cero",()=>{
        const p=new Proceso(1, 200, 5)
        expect(p.getQuantumConsumido()).toBe(0)
    })
    test("Un proceso recien creado no tiene bloqueo pendiente",()=>{
        const p = new Proceso(1, 200, 5)
        expect(p.getBloqueoRestante()).toBe(0)
    })

describe("Transicion bloquear() y estado Bloqueado", () => {
    test("transiciona de Ejecutando a Bloqueado, asigna duracion a bloqueoRestante y resetea quantum", () => {
        const evento = new EventoES(2, 3)
        const p = new Proceso(1, 200, 5, evento)
        p.admitir()
        p.despachar()
        p.ejecutar()
        expect(p.getEstado()).toBe(EstadodeProceso.Ejecutando);
        expect(p.getQuantumConsumido()).toBe(1)
        p.bloquear()
        expect(p.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(p.getBloqueoRestante()).toBe(3)
        expect(p.getQuantumConsumido()).toBe(0)
    })

    test("ignora la transicion a Bloqueado si el proceso no está en estado Ejecutando", () => {
        const evento = new EventoES(2, 3)
        const p = new Proceso(1, 200, 5, evento)
        p.bloquear()
        expect(p.getEstado()).toBe(EstadodeProceso.Nuevo);
        expect(p.getBloqueoRestante()).toBe(0)
    })
    
    describe("Transicion desbloquear() y vuelta a Listo", () => {
        test("desbloquea a Listo si esta Bloqueado y el bloqueo restante es cero", () => {
            const evento = new EventoES(1, 0)
            const p = new Proceso(1, 200, 5, evento)

            p.admitir()
            p.despachar()
            p.bloquear()

            expect(p.getEstado()).toBe(EstadodeProceso.Bloqueado)
            expect(p.getBloqueoRestante()).toBe(0)

            p.desbloquear()

            expect(p.getEstado()).toBe(EstadodeProceso.Listo);
        })

    })
})
})
