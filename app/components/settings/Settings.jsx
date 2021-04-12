import React from 'react';
import {View, ScrollView, StyleSheet,} from 'react-native';
import {List, Checkbox} from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
const colors=['#b4becb', '#e1e8f5'];
const start = { x: 0, y: 0 };
const end = { x: 1, y: 1 };

const Settings = () => {
    const [checked, setChecked] = React.useState(true);

    return <View style={styles.container}>
        <LinearGradient
            colors={colors}
            start={start}
            end={end}
            style={styles.container}>
            <ScrollView style={styles.textArea}>
                <List.Item
                    title="Auto-refresh static data"
                    description="Auto refresh the app's static data - FIR Boundaries, Airport codes, etc."
                    left={props => <List.Icon {...props} icon="refresh" />}
                    right={() =>
                        <Checkbox
                            status={checked ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setChecked(!checked);
                            }}
                        />
                    }/>
            </ScrollView>
        </LinearGradient>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    textArea: {
        margin: 20,
        flex: 1
    }
});

export default Settings;