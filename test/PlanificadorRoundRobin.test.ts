import { describe, test, expect } from "vitest"
import { PlanificadorRoundRobin } from "../src/PlanificadorRoundRobin"
import { Proceso } from "../src/Proceso"
import { EventoES } from "../src/EventoES"
import { EstadodeProceso } from "../src/EstadodeProceso"

describe("PlanificadorRoundRobin", () => {
    test("encola y despacha procesos respetando el orden FIFO", () => {
        const planificador = new PlanificadorRoundRobin(2)
        const p1 = new Proceso(1, 100, 4)
        const p2 = new Proceso(2, 100, 4)

        p1.admitir()
        p2.admitir()

        planificador.encolar(p1)
        planificador.encolar(p2)

        expect(planificador.getListos()).toEqual([1, 2])
        planificador.despacharYEjecutar()
        expect(planificador.getEnCpu()).toBe(1)
        expect(planificador.getListos()).toEqual([2])
        expect(p1.getEstado()).toBe(EstadodeProceso.Ejecutando)
    });

    test("desaloja por vencimiento de Quantum y rota al final de la cola si hay otro listo", () => {
        const planificador = new PlanificadorRoundRobin(2)
        const p1 = new Proceso(1, 100, 5)
        const p2 = new Proceso(2, 100, 5)

        p1.admitir()
        p2.admitir()
        planificador.encolar(p1)
        planificador.encolar(p2)
        planificador.despacharYEjecutar()
        expect(p1.getQuantumConsumido()).toBe(1)
        planificador.despacharYEjecutar()
        expect(planificador.getEnCpu()).toBeUndefined()
        expect(p1.getEstado()).toBe(EstadodeProceso.Listo)
        expect(p1.getQuantumConsumido()).toBe(0)
        
        expect(planificador.getListos()).toEqual([2, 1])
    })

    test("bloquea por evento de E/S y lo devuelve a Listos al finalizar la espera", () => {
        const planificador = new PlanificadorRoundRobin(5)
        const evento = new EventoES(1, 2)
        const p = new Proceso(1, 100, 4, evento)

        p.admitir()
        planificador.encolar(p)

        planificador.despacharYEjecutar()

        expect(planificador.getEnCpu()).toBeUndefined()
        expect(p.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(planificador.getBloqueados()).toEqual([1])
        expect(p.getBloqueoRestante()).toBe(2)

        planificador.actualizarBloqueados()
        expect(p.getBloqueoRestante()).toBe(1)
        expect(planificador.getBloqueados()).toEqual([1])

        planificador.actualizarBloqueados()
        expect(p.getBloqueoRestante()).toBe(0)
        expect(planificador.getBloqueados()).toEqual([])
        expect(planificador.getListos()).toEqual([1])
        expect(p.getEstado()).toBe(EstadodeProceso.Listo)
    });

    test("retorna el proceso cuando finaliza para permitir la liberación de memoria", () => {
        const planificador = new PlanificadorRoundRobin(2)
        const p = new Proceso(1, 100, 1)

        p.admitir()
        planificador.encolar(p)

        const terminado = planificador.despacharYEjecutar()

        expect(terminado).toBe(p);
        expect(p.getEstado()).toBe(EstadodeProceso.Terminado)
        expect(p.getCpuRestante()).toBe(0)
        expect(planificador.getEnCpu()).toBeUndefined()
    })

    test("registra métricas de CPU ocupada y cambios de contexto con precisión", () => {
        const planificador = new PlanificadorRoundRobin(1)
        const p1 = new Proceso(1, 100, 2)
        const p2 = new Proceso(2, 100, 2)

        p1.admitir()
        p2.admitir()

        planificador.encolar(p1);
        planificador.encolar(p2);

        planificador.despacharYEjecutar();
        planificador.despacharYEjecutar();

        expect(planificador.getTicksCpuOcupada()).toBe(2);
        expect(planificador.getCambiosContexto()).toBe(1);
    });
});