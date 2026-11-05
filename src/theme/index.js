import { Platform } from "react-native"; 

export const colors = {
    fondo: "#F6F7FB",
    primaria: '#DC0A2D', 
    texto: '#111827',
    border: '#14377e',
    error: '#E11900',    
    placeholder: '#9CA3AF' 
}

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
}

export const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
}

export const typography = {
    titulo: { 
        fontSize: 26,       
        fontWeight: '700',  
        color: colors.texto 
    },
    subtitulo: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: colors.texto 
    }
}

export const columns = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 6
}

export default { colors, spacing, typography, radius, columns }