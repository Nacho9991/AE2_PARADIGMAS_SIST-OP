import { describe, it, expect } from "vitest";
import { EstadodeProceso } from "../src/EstadodeProceso";

describe ( "Estado de proceso", () => {

    it("Acá se guardan los seis estados del proceso", () => {
        expect (Object.values(EstadodeProceso)).toEqual([
            "Nuevo", "Esperando memoria", "Listo", "Ejecutando", "Bloqueado", "Terminado"
    ]);
});

});