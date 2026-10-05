import {describe, test, expect} from "vitest"
import {Simulador} from "../src/Simulador"
import {EstadodeProceso} from "../src/EstadodeProceso"

describe("Inicio de la simulacion", () => {
    test("inicia con tick 0, memoria y quantum correctos si la configuracion es valida", ()=>{
        const sim = new Simulador (1024, 5);
        expect(sim.getTick()).toBe(0);
        expect(sim.getMemoriaTotal()).toBe(1024)
        expect(sim.getQuantum()).toBe(5);
        expect(sim.esValido()).toBe(true)
    });

    test("rechaza configuracion con memmoria menor o igual a cero o flotante", ()=>{
        const simNegativa = new Simulador (-100, 5);
        const simCero = new Simulador (0, 4);
        const simFlotante = new Simulador (512.5, 5);

        expect(simNegativa.esValido()).toBe(false);
        expect(simCero.esValido()).toBe(false)
        expect(simFlotante.esValido()).toBe(false);

        expect(simCero.getMapaMemoria()).toHaveLength(0);

    });

    test("rechaza configuracion con quantum menor o igual a cero o flotante", ()=>{
        const simNegativa = new Simulador (1024, 0);
        const simCero = new Simulador (1024, -2);
        const simFlotante = new Simulador (1024, 2.5);
        
        expect(simNegativa.esValido()).toBe(false);
        expect(simCero.esValido()).toBe(false)
        expect(simFlotante.esValido()).toBe(false);
        
        expect(simCero.getMapaMemoria()).toHaveLength(0);
    });

    test("Inicia con las colas vacias y un unico bloque libre que cubre toda la memoria", ()=>{
        const sim = new Simulador (1024, 5);
        expect(sim.getProcesos()).toHaveLength(0);
        
        const mapa = sim.getMapaMemoria();
        expect(mapa).toHaveLength(1);
        expect(mapa[0].getInicio()).toBe(0);
        expect(mapa[0].getTamanio()).toBe(1024);
        expect(mapa[0].estaLibre()).toBe(true);
    });
    
});


describe("Carga de lotes de procesos", () => {
    test("Registra un proceso correctamente con estado inicial nuevo", ()=>{
        const sim = new Simulador (1024, 5);
        sim.registrarProceso(1, 256, 10);

        expect(sim.getProcesos()).toHaveLength(1);
        const proceso = sim.getProcesos()[0];
        expect(proceso.getPid()).toBe(1);
        expect(proceso.getMemoriaRequerida()).toBe(256);
        expect(proceso.getCpuTotal()).toBe(10);
    });

    test("ignora procesosi el PID ya existe", ()=>{
        const sim = new Simulador (1024, 5);
        sim.registrarProceso(1, 256, 10)
        sim.registrarProceso(1, 128, 5)

        expect(sim.getProcesos()).toHaveLength(1);
        expect(sim.getProcesos()[0].getMemoriaRequerida()).toBe(256)
    });

    test("ignora proceso requiere mas memoria que el total del siguente", ()=>{
        const sim = new Simulador (512, 5)
        sim.registrarProceso(1, 1024, 10)
        expect(sim.getProcesos()).toHaveLength(0)
    });

    test("ignora proceso con parametros no enteros o menores/iguales a cero", ()=>{
        const sim = new Simulador (1024, 5);
        sim.registrarProceso(0, 256, 10)
        sim.registrarProceso(1, -256, 10)
        sim.registrarProceso(2, 256, 0)
        sim.registrarProceso(3, 256.5, 10)
        
        expect(sim.getProcesos()).toHaveLength(0)
    })
//leer
    test("admitirProcesos transiciona de Nuevo Listohay memoria disponible", () => {
        const sim = new Simulador(1000, 5)
        sim.registrarProceso(1, 400, 10)
        sim.registrarProceso(2, 400, 10)
        sim.registrarProceso(3, 800, 10)
    
        sim.tick()
        const p1 = sim.getProceso(1)
        const p2 = sim.getProceso(2)
        const p3 = sim.getProceso(3)

        expect(p1?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p2?.getEstado()).toBe(EstadodeProceso.Listo)
        expect(p3?.getEstado()).toBe(EstadodeProceso.Nuevo)
    })
    })

    //leer devuelta

    test("despacharYEjecutar transiciona de Listo a Ejecutando y consume 1 ciclo de CPU", () => {
        const sim = new Simulador(1000, 5)
        sim.registrarProceso(1, 400, 10)

        sim.tick()

        const p1 = sim.getProceso(1)

        expect(p1?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1?.getCpuRestante()).toBe(9)
        expect(sim.getTickActual()).toBe(1)
    })
