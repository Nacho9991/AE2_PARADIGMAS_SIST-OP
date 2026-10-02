import { describe, it, expect } from "vitest";
import { EstadodeProceso } from "../src/EstadodeProceso";

describe ( "Estado de proceso", () => {

    tes("Acá se guardan los seis estados del proceso", () => {
        expect (Object.values(EstadodeProceso)).toEqual([
            "Nuevo", "Esperando memoria", "Ejecutando","Listo", "Bloqueado", "Terminado"
    ]);
});

});