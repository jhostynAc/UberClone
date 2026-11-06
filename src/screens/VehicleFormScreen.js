import React from "react";
import VehicleInfo from "../components/VehicleInfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet} from "react-native";
import { colors, spacing, columns } from '../theme';



export default function VehicleForm (){
        const insets = useSafeAreaInsets();

    return(
        <View style={[styles.pantalla, { paddingTop: insets.top + spacing.md }]}>
                    <VehicleInfo/>
        </View>
    )
}
const styles = StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colors.fondo }
})