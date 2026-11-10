import React from "react";
import DocumentsInfo from "../components/Documents";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet} from "react-native";
import { colors, spacing, columns } from '../theme';



export default function DocumentsForm (){
        const insets = useSafeAreaInsets();

    return(
        <View style={[styles.pantalla, { paddingTop: insets.top + spacing.md }]}>
                    <DocumentsInfo/>
        </View>
    )
}
const styles = StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colors.fondo }
})