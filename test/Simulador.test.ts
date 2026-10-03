import {describe, test, expect} from "vitest"
import {Simulador} from "../src/Simulador"

describe("Inicio de la simulacion", () => {
    test("inicia con tick 0, memoria y quantum correctos si la configuracion es valida", ()=>{
        const sim = new Simulador (1024, 5);
        expect(sim.getTick()).toBe(0);
        expect(sim.getMemoriaRequerida()).toBe(1024)
        expect(sim.getQuantum()).toBe(5);
        expect(sim.esValido()).toBe(true)
    });

     test("rechaza configuracion con memmoria menor o igual a cero o flotante", ()=>{
        const simNegativa = new Simulador (-100, 5);
        const simCero = new Simulador (0, 4);
        const simFlotante = new Simulador (512.5, 5);

        expect(simNegativa.getTick()).toBe(false);
        expect(simCero.getMemoriaRequerida()).toBe(false)
        expect(simFlotante.getQuantum()).toBe(false);
        });

    test("rechaza configuracion con quantum menor o igual a cero o flotante", ()=>{
        const simNegativa = new Simulador (-100, 5);
        const simCero = new Simulador (0, 4);
        const simFlotante = new Simulador (512.5, 5);
        
        expect(simNegativa.getTick()).toBe(false);
        expect(simCero.getMemoriaRequerida()).toBe(false)
        expect(simFlotante.getQuantum()).toBe(false);
        });
})