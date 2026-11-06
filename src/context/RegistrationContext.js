import React, { createContext, useState } from 'react';

// Creamos el contexto
export const RegistrationContext = createContext();

// Creamos el proveedor que envolverá tu app
export const RegistrationProvider = ({ children }) => {
    // Este estado global guardará todo el progreso del conductor
    const [datosGlobales, setDatosGlobales] = useState({
        personales: {
            fotoPerfil: null,
            nombre: '',
            documento: '',
            telefono: '',
            fechaNacimiento: null,
            genero: '',
            correo: ''
        },
        vehiculo: {
            // Aquí irán los campos de la pestaña 2
            placa: '',
            modelo: '',
            color: ''
        }
    });

    // Función para actualizar una sección específica sin borrar lo demás
    const actualizarDatos = (seccion, nuevosDatos) => {
        setDatosGlobales(prev => ({
            ...prev,
            [seccion]: { ...prev[seccion], ...nuevosDatos }
        }));
    };

    return (
        <RegistrationContext.Provider value={{ datosGlobales, actualizarDatos }}>
            {children}
        </RegistrationContext.Provider>
    );
};