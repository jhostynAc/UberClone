import React from "react";
import PersonInfo from "../components/PersonInfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet} from "react-native";
import { colors, spacing, columns } from '../theme';



export default function PersonForm (){
        const insets = useSafeAreaInsets();

    return(
        <View style={[styles.pantalla, { paddingTop: insets.top + spacing.md }]}>
                    <PersonInfo/>
        </View>
    )
}
const styles = StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colors.fondo }
})