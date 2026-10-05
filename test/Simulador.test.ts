import {describe, test, expect} from "vitest"
import {Simulador} from "../src/Simulador"
import {EstadodeProceso} from "../src/EstadodeProceso"
import { EventoES } from "../src/EventoES"

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

     test("despacharYEjecutar: transiciona a Terminado y libera memoria cuando cpuRestante llega a 0", () => {
        const sim = new Simulador(1000, 5)
        sim.registrarProceso(1, 400, 1)

        sim.tick()
        const p1 = sim.getProceso(1)
        const bloques = sim.getMapaMemoria()
        expect(p1?.getEstado()).toBe(EstadodeProceso.Terminado)
        expect(p1?.getCpuRestante()).toBe(0)
        expect(bloques).toHaveLength(1)
        expect(bloques[0].estaLibre()).toBe(true)
        expect(bloques[0].getTamanio()).toBe(1000)
    })

    test("Round Robin desaloja a Listo y resetea quantum si agota el quantum y hay otro proceso listo", () => {
        const sim = new Simulador(1000, 2)
        sim.registrarProceso(1, 400, 5)
        sim.registrarProceso(2, 400, 5)
    
        sim.tick()
        const p1 = sim.getProceso(1)
        expect(p1?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1?.getQuantumConsumido()).toBe(1)
        sim.tick();
        const p1Post = sim.getProceso(1)
        const p2Post = sim.getProceso(2)
        expect(p1Post?.getEstado()).toBe(EstadodeProceso.Listo)
        expect(p1Post?.getQuantumConsumido()).toBe(0)
        expect(p2Post?.getEstado()).toBe(EstadodeProceso.Listo)
    })
    test("Round Robin: renueva quantum y continua ejecutando si vence el quantum pero no hay otro proceso listo", () => {
        const sim = new Simulador(1000, 2)
        sim.registrarProceso(1, 400, 5)
        sim.tick()
        const p1Tick1 = sim.getProceso(1)
        expect(p1Tick1?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1Tick1?.getQuantumConsumido()).toBe(1)

        sim.tick();
        const p1Tick2 = sim.getProceso(1)
        expect(p1Tick2?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1Tick2?.getQuantumConsumido()).toBe(0)
        expect(p1Tick2?.getCpuRestante()).toBe(3)

        sim.tick()
        const p1Tick3 = sim.getProceso(1)
        expect(p1Tick3?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1Tick3?.getQuantumConsumido()).toBe(1)
        expect(p1Tick3?.getCpuRestante()).toBe(2)
    })

    test("Round Robin: alterna entre procesos listos respetando FIFO al vencer el quantum", () => {
        const sim = new Simulador(1000, 2)
        sim.registrarProceso(1, 400, 5)
        sim.registrarProceso(2, 400, 5)

       
        sim.tick();
        const p1Tick1 = sim.getProceso(1)
        const p2Tick1 = sim.getProceso(2)
        expect(p1Tick1?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1Tick1?.getQuantumConsumido()).toBe(1)
        expect(p2Tick1?.getEstado()).toBe(EstadodeProceso.Listo)

        sim.tick();
        const p1Tick2 = sim.getProceso(1)
        const p2Tick2 = sim.getProceso(2)
        expect(p1Tick2?.getEstado()).toBe(EstadodeProceso.Listo)
        expect(p1Tick2?.getQuantumConsumido()).toBe(0)
        expect(p2Tick2?.getEstado()).toBe(EstadodeProceso.Listo)

        const colaListos = sim.getProcesos().filter((p) => p.getEstado() === EstadodeProceso.Listo)
        expect(colaListos[0].getPid()).toBe(2)
        expect(colaListos[1].getPid()).toBe(1)

        sim.tick()
        const p1Tick3 = sim.getProceso(1)
        const p2Tick3 = sim.getProceso(2)
        expect(p1Tick3?.getEstado()).toBe(EstadodeProceso.Listo)
        expect(p2Tick3?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p2Tick3?.getQuantumConsumido()).toBe(1)
    })

    test("E/S: un proceso transiciona a Bloqueado al alcanzar ticksCpuParaDisparo y libera la CPU", () => {
        const sim = new Simulador(1000, 5); // Quantum amplio (5)
        const evento = new EventoES(2, 3);   // Dispara tras 2 ticks de CPU, dura 3 ticks
        sim.registrarProceso(1, 400, 5, evento);

        // Tick 1: P1 ejecuta 1 ciclo
        sim.tick();
        const p1Tick1 = sim.getProceso(1);
        expect(p1Tick1?.getEstado()).toBe(EstadodeProceso.Ejecutando);

        // Tick 2: P1 ejecuta su 2do ciclo -> alcanza ticksCpuParaDisparo (2) -> pasa a Bloqueado
        sim.tick();
        const p1Tick2 = sim.getProceso(1);
        expect(p1Tick2?.getEstado()).toBe(EstadodeProceso.Bloqueado);
        expect(p1Tick2?.getBloqueoRestante()).toBe(3);

        // Tick 3: La CPU queda libre (ningún proceso ejecutando)
        sim.tick();
        const procesoEnCpu = sim.getProcesos().find(
            (p) => p.getEstado() === EstadodeProceso.Ejecutando
        );
        expect(procesoEnCpu).toBeUndefined();
    });

    test("E/S vs Quantum: el bloqueo por E/S tiene prioridad sobre el vencimiento del quantum", () => {
        const sim = new Simulador(1000, 2)
        const evento = new EventoES(2, 3)
        sim.registrarProceso(1, 400, 5, evento)
        sim.registrarProceso(2, 400, 5)
        sim.tick()
        sim.tick()
        const p1 = sim.getProceso(1)
        const p2 = sim.getProceso(2)

        expect(p1?.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(p1?.getBloqueoRestante()).toBe(3)
        expect(p2?.getEstado()).toBe(EstadodeProceso.Listo)

        sim.tick()
        const p2Post = sim.getProceso(2)
        expect(p2Post?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p2Post?.getQuantumConsumido()).toBe(1)
    })

    test("E/S: decrementa bloqueoRestante en cada tick y desbloquea a Listo al llegar a 0", () => {
        const sim = new Simulador(1000, 5)
        const evento = new EventoES(1, 2)
        sim.registrarProceso(1, 400, 5, evento)
        sim.tick()
        const p1Tick1 = sim.getProceso(1)
        expect(p1Tick1?.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(p1Tick1?.getBloqueoRestante()).toBe(2)

        sim.tick();
        const p1Tick2 = sim.getProceso(1)
        expect(p1Tick2?.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(p1Tick2?.getBloqueoRestante()).toBe(1)
        sim.tick();
        const p1Tick3 = sim.getProceso(1)
        expect(p1Tick3?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p1Tick3?.getBloqueoRestante()).toBe(0)
        expect(p1Tick3?.getCpuRestante()).toBe(3)
    })

    test("E/S y FIFO: un proceso que se desbloquea pasa al final de Listo cediendo CPU al que ya esperaba", () => {
        const sim = new Simulador(1000, 5)
        const evento = new EventoES(1, 1)
        sim.registrarProceso(1, 400, 5, evento)
        sim.registrarProceso(2, 400, 5)

        sim.tick()
        expect(sim.getProceso(1)?.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(sim.getProceso(2)?.getEstado()).toBe(EstadodeProceso.Listo)

        sim.tick()
        const p1Tick2 = sim.getProceso(1)
        const p2Tick2 = sim.getProceso(2)

        expect(p1Tick2?.getEstado()).toBe(EstadodeProceso.Listo)
        expect(p2Tick2?.getEstado()).toBe(EstadodeProceso.Ejecutando)
        expect(p2Tick2?.getCpuRestante()).toBe(4)
    })

    describe("Utilización de CPU (RF09.5)", () => {
        test("es 0% cuando la simulación inicia en tick 0", () => {
            const sim = new Simulador(1000, 5);
            expect(sim.getUtilizacionCpu()).toBe(0);
        });

        test("es 0% si la CPU permanece completamente ociosa", () => {
            const sim = new Simulador(1000, 5);

            // Corremos 5 ticks sin ningún proceso cargado
            for (let i = 0; i < 5; i++) {
                sim.tick();
            }

            expect(sim.getTickActual()).toBe(5);
            expect(sim.getTicksCpuOcupada()).toBe(0);
            expect(sim.getUtilizacionCpu()).toBe(0);
        });

        test("es 100% cuando la CPU está siempre ocupada", () => {
            const sim = new Simulador(1000, 5);
            sim.registrarProceso(1, 400, 10); // Necesita 10 ticks de CPU

            for (let i = 0; i < 10; i++) {
                sim.tick();
            }

            expect(sim.getTickActual()).toBe(10);
            expect(sim.getTicksCpuOcupada()).toBe(10);
            expect(sim.getUtilizacionCpu()).toBe(100);
        });

        test("es 50% cuando la CPU trabaja la mitad de los ticks", () => {
            const sim = new Simulador(1000, 5);
            sim.registrarProceso(1, 400, 5); // Ejecuta exactamente 5 ticks

            // Ejecutamos 10 ticks en total (5 con CPU ocupada, 5 ociosa)
            for (let i = 0; i < 10; i++) {
                sim.tick();
            }

            expect(sim.getTickActual()).toBe(10);
            expect(sim.getTicksCpuOcupada()).toBe(5);
            expect(sim.getUtilizacionCpu()).toBe(50);
        });

        test("los ticks de un proceso en Bloqueado por E/S no cuentan como CPU ocupada", () => {
            const sim = new Simulador(1000, 5)
            const evento = new EventoES(1, 4)
            sim.registrarProceso(1, 400, 2, evento)

            sim.tick()
            sim.tick()
            sim.tick()
            sim.tick()
            
            expect(sim.getTickActual()).toBe(4)
            expect(sim.getTicksCpuOcupada()).toBe(1)
            expect(sim.getUtilizacionCpu()).toBe(25)
        })
    })