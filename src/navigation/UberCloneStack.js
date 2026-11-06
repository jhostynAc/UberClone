import React from "react";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { colors, spacing, columns } from '../theme';
import PersonFormScreen from '../screens/PersonFormScreen'
import VehicleFormScreen from '../screens/VehicleFormScreen'

const Stack = createNativeStackNavigator();

export default function UberCloneStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Datos Personales"
                component={PersonFormScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Datos del Vehículo"
                component={VehicleFormScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}