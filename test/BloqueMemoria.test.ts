import {describe, test, expect} from "vitest"
import {BloqueMemoria} from "../src/BloqueMemoria"

describe("BloqueMemoria", () => {
    test("Inicia como bloque libre cuando no tiene PID asignado", ()=>{
        const bloque = new BloqueMemoria (0, 1024);
        
        expect(bloque.getInicio()).toBe(0);
        expect(bloque.getTamanio()).toBe(1024)
        expect(bloque.getPidAsignado()).toBeUndefined()
        expect(bloque.estaLibre()).toBe(true)
    })

    test("reconoce cuando esta ocupado por un proceso", ()=>{
        const bloqueOcupado = new BloqueMemoria (0, 256, 1);
       
        expect(bloqueOcupado.getPidAsignado()).toBe(1)
        expect(bloqueOcupado.estaLibre()).toBe(false);
    })
})