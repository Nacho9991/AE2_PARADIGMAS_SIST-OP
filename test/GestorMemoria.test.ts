import {describe, test, expect} from "vitest"
import {GestorMemoria} from "../src/GestorMemoria"

describe("GestorMemoria", () => {
    test("Inicia como bloque libre que abarca toda la memoria", ()=>{
        const gestor = new GestorMemoria (1024);
        
        expect(gestor.getMemoriaTotal()).toBe(1024);
        expect(gestor.getBloques()).toHaveLength(1);

        const bloqueInicial = gestor.getBloques()[0];
         expect(bloqueInicial.getInicio()).toBe(0);
         expect(bloqueInicial.getTamanio()).toBe(1024);
         expect(bloqueInicial.estaLibre()).toBe(true);
    });
})