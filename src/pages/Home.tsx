import React from "react";
import MainLayout from "../layouts/MainLayout";
const Home: React.FC = () => {
    return (
        <div className="">
            <MainLayout text="Inicio">
                <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-4">Bienvenido al Sistema de Gestión de Alumnos</h2>
                    <p className="mb-2">Aquí podrás gestionar la información de los estudiantes de manera eficiente.</p>
                </div>
            </MainLayout>
        </div>

        
    );
};

export default Home;
