export type Estudiante = {
  idestudiante: string
  numerocontrol: string
  nombre: string
  apellidopaterno: string
  apellidomaterno: string
  semestre: number
  idcarrera: string
}

export type EstudianteConCarrera = Estudiante & {
  carrera:
    | { idcarrera: string; nombre: string }
    | { idcarrera: string; nombre: string }[]
    | null;
};



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

export type Materia = {
  idmateria: string;
  nombre: string;
  iddocente: string | null;
  idcarrera: string | null;
  semestre: number | null;
};

export type MateriaConCarrera = Materia & {
  carrera:
    | { idcarrera: string; nombre: string }
    | { idcarrera: string; nombre: string }[]
    | null;
};