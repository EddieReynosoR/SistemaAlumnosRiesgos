export type Estudiante = {
  idestudiante: string
  numerocontrol: string
  nombre: string
  apellidopaterno: string
  apellidomaterno: string
  semestre: number
}

export type Carrera = {
    idcarrera: string
    nombre: string
}

export type Factor = {
  idfactor: string;
  descripcion: string;
  categoria: FactorTipo;
};

export const FactorTipo = {
  economico: "economico",
  academico: "academico",
  psicosocial: "psicosocial",
  institucional: "institucional",
  tecnologico: "tecnologico",
  contextual: "contextual"
} as const;

export type FactorTipo = typeof FactorTipo[keyof typeof FactorTipo];