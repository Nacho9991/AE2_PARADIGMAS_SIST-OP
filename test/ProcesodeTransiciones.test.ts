import{describe, test, expect} from "vitest";
import {Proceso} from "../src/Proceso"
import {EstadodeProceso} from "../src/EstadodeProceso";

describe("transiciones de proceso", () => {
    test("nuevo pasa a esperandomemoria cuando no entra en la RAM", ()=> {
        const p = new Proceso(1, 200, 5);
        p.esperarMemoria();
        expect(p.getEstado()).toBe(EstadodeProceso.Esperando_Memoria);
    });
    test("nuevo pasa a listo cuando se le asigna memoria", ()=> {
        const p = new Proceso(1, 200, 5);
        p.admitir();
        expect(p.getEstado()).toBe(EstadodeProceso.Listo);
    });
    test("Listo pasa a ejecutando al ser despachado", ()=> {
        const p = new Proceso(1, 200, 5);
        p.admitir();
        p.despachar();
        expect(p.getEstado()).toBe(EstadodeProceso.Ejecutando);
    });
    test("Un proceso terminado no puede volver a listo", ()=> {
        const p = new Proceso(1, 200, 5);
        p.admitir();
        p.despachar();
        p.terminar();
        p.admitir();
        expect(p.getEstado()).toBe(EstadodeProceso.Terminado);
    });
})