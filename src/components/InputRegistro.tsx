interface InputRegistroProps {
    Nombre: string;
}

function InputRegistro({ Nombre }: InputRegistroProps) {
    return (
        <div className="">
            <legend className="">{Nombre}:</legend>
            <div>
                <input id={Nombre} type="text" className="p-2 border-2   rounded-lg " />
            </div>
        </div>
    );
}
interface MultiOpcionProps {
  Nombre: string;
  opciones?: string[];
}

function MultiOpcion({ Nombre, opciones = [] }: MultiOpcionProps) {
  const listId = `${Nombre}-list`; // 👈 genera un id único para vincular el datalist

  return (
    <div>
      <legend className="">{Nombre}:</legend>
      <div>
        <input
          id={Nombre}
          list={listId} // 👈 vincula el input con el datalist
          className="p-2 border-2 rounded-lg"
        />

        {/* 👇 este es el datalist con las opciones */}
        <datalist id={listId}>
          {opciones.map((opcion, index) => (
            <option key={index} value={opcion} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

export default InputRegistro;
export { MultiOpcion };
