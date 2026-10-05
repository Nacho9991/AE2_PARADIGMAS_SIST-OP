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
        expect(p3?.getEstado()).toBe(EstadodeProceso.Esperando_Memoria)
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
        const sim = new Simulador(1000, 5)
        const evento = new EventoES(2, 3)
        sim.registrarProceso(1, 400, 5, evento)

     
        sim.tick();
        const p1Tick1 = sim.getProceso(1);
        expect(p1Tick1?.getEstado()).toBe(EstadodeProceso.Ejecutando)

       
        sim.tick()
        const p1Tick2 = sim.getProceso(1)
        expect(p1Tick2?.getEstado()).toBe(EstadodeProceso.Bloqueado)
        expect(p1Tick2?.getBloqueoRestante()).toBe(3)

        sim.tick()
        const procesoEnCpu = sim.getProcesos().find(
            (p) => p.getEstado() === EstadodeProceso.Ejecutando
        )
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
            const sim = new Simulador(1000, 5)
            for (let i = 0; i < 5; i++) {
                sim.tick()
            }

            expect(sim.getTickActual()).toBe(5)
            expect(sim.getTicksCpuOcupada()).toBe(0)
            expect(sim.getUtilizacionCpu()).toBe(0)
        });

        test("es 100% cuando la CPU está siempre ocupada", () => {
            const sim = new Simulador(1000, 5);
            sim.registrarProceso(1, 400, 10)

            for (let i = 0; i < 10; i++) {
                sim.tick();
            }

            expect(sim.getTickActual()).toBe(10)
            expect(sim.getTicksCpuOcupada()).toBe(10)
            expect(sim.getUtilizacionCpu()).toBe(100)
        })

        test("es 50% cuando la CPU trabaja la mitad de los ticks", () => {
            const sim = new Simulador(1000, 5);
            sim.registrarProceso(1, 400, 5)
            for (let i = 0; i < 10; i++) {
                sim.tick();
            }

            expect(sim.getTickActual()).toBe(10)
            expect(sim.getTicksCpuOcupada()).toBe(5)
            expect(sim.getUtilizacionCpu()).toBe(50)
        })

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

   describe("Integracion de metricas", () => {
     test("Inicia con metricas en estado base antes del primer tick", () => {
            const sim = new Simulador(1000, 2)
            const m = sim.getMetricas()
            expect(m).toEqual({
                memoriaLibreTotal: 1000,
                mayorBloqueLibre: 1000,
                ocupacionMemoria: 0,
                fragmentacionExterna: 0,
                utilizacionCpu: 0,
                cambiosContexto: 0,
            })

        })

        test("calcula el registro del estado completo de metricas tras un escenario mixto", () => {
            const sim = new Simulador(1000, 2)
            sim.registrarProceso(1, 300, 2)
            sim.registrarProceso(2, 400, 3)
            sim.tick()
            sim.tick()
            sim.tick()

            const m = sim.getMetricas()
            expect(m.ocupacionMemoria).toBe(400)
            expect(m.memoriaLibreTotal).toBe(600)
            expect(m.mayorBloqueLibre).toBe(300)
            expect(m.fragmentacionExterna).toBe(300)
            expect(m.utilizacionCpu).toBe(100)
            expect(m.cambiosContexto).toBe(1)
        })
   })

   describe("Consulta del estado completo del sistema", () => {
        test("devuelve el registro del estado inicial con CPU libre colas vacias y mapa intacto", () => {
            const sim = new Simulador(1000, 2)
            const estado = sim.getEstadoSistema()
            expect(estado.tick).toBe(0)
            expect(estado.cpu).toBeUndefined()
            expect(estado.listos).toEqual([])
            expect(estado.esperandoMemoria).toEqual([])
            expect(estado.bloqueados).toEqual([])
            expect(estado.terminados).toEqual([])
            expect(estado.mapaMemoria).toHaveLength(1)
            expect(estado.mapaMemoria[0].estaLibre()).toBe(true)
            expect(estado.mapaMemoria[0].getTamanio()).toBe(1000)
        })

        test("refleja con precision procesos distribuidos en todos los estados posibles", () => {
            const sim = new Simulador(1000, 2)
            sim.registrarProceso(1, 300, 1)
            const evento = new EventoES(1, 3)
            sim.registrarProceso(2, 300, 3, evento)
            sim.registrarProceso(3, 300, 4)
            sim.registrarProceso(4, 500, 2)
            sim.tick();
            sim.tick()
            sim.tick()

            const estado = sim.getEstadoSistema()
            expect(estado.tick).toBe(3)
            expect(estado.cpu).toBe(3)                    
            expect(estado.bloqueados).toEqual([2])          
            expect(estado.esperandoMemoria).toEqual([4])    
            expect(estado.terminados).toEqual([1])      
        })

        test("garantiza inmutabilidad: el registro del estado previo no se modifica con ticks posteriores", () => {
            const sim = new Simulador(1000, 2)
            sim.registrarProceso(1, 400, 2)
            sim.tick()

            const estadoAnterior = sim.getEstadoSistema();
            expect(estadoAnterior.tick).toBe(1)
            expect(estadoAnterior.cpu).toBe(1)
            expect(estadoAnterior.terminados).toEqual([])
            sim.tick()
            expect(estadoAnterior.tick).toBe(1)
            expect(estadoAnterior.cpu).toBe(1)
            expect(estadoAnterior.terminados).toEqual([])

            const estadoNuevo = sim.getEstadoSistema()
            expect(estadoNuevo.tick).toBe(2)
            expect(estadoNuevo.terminados).toEqual([1])
        })
    })
