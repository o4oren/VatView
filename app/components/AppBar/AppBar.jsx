import * as React from 'react';
import {Appbar, Divider, Menu} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useState} from 'react';
import {StatusBar} from 'expo-status-bar';

const AppBar = ({ navigation }) => {
    const [showMenu, setShowMenu] = useState(false);
    const openMenu = () => setShowMenu(true);
    const closeMenu = () => setShowMenu(false);

    return (
        <Appbar.Header style={styles.appbar} dark={true}>
            <StatusBar style="light"/>
            {/*<Appbar.BackAction onPress={navigation.goBack()} />*/}
            <Appbar.Content title="VatView" dark={true}/>
            <Menu
                visible={showMenu}
                onDismiss={closeMenu}
                anchor={
                    <Appbar.Action icon="dots-vertical" color={'white'} onPress={openMenu} />
                }
            >
                <Divider />
                <Menu.Item onPress={() => {navigation.navigate('About');}} title="About" />
            </Menu>
        </Appbar.Header>
    );
};


const styles = StyleSheet.create({
    appbar: {
        alignSelf: 'center'
    }
});

export default AppBar;