import React, {useState, useEffect} from 'react';
import {View, ScrollView, TextInput, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../common/ThemeProvider';
import ThemedText from '../shared/ThemedText';
import {tokens} from '../../common/themeTokens';
import allActions from '../../redux/actions';
import {PILOT_ROLE_COLORS} from '../../common/aircraftIconService';

const MyVatsimSettings = () => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const {activeTheme} = useTheme();
    const navigation = useNavigation();
    const myCid = useSelector(state => state.app.myCid);
    const friendCids = useSelector(state => state.app.friendCids);
    const [cidInput, setCidInput] = useState(myCid);
    const [friendInput, setFriendInput] = useState('');

    useEffect(() => {
        setCidInput(myCid);
    }, [myCid]);

    const handleCidBlur = () => {
        const trimmed = cidInput.trim();
        if (trimmed && !/^\d+$/.test(trimmed)) return; // ignore non-numeric
        dispatch(allActions.appActions.saveMyCid(trimmed));
    };

    const handleAddFriend = () => {
        const val = friendInput.trim();
        if (!val || !/^\d+$/.test(val) || friendCids.includes(val)) return;
        dispatch(allActions.appActions.saveFriendCids([...friendCids, val]));
        setFriendInput('');
    };

    const handleRemoveFriend = (cid) => {
        dispatch(allActions.appActions.saveFriendCids(friendCids.filter(c => c !== cid)));
    };

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 12}]}
                keyboardShouldPersistTaps="handled"
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color={activeTheme.text.primary} />
                </Pressable>
                <ThemedText variant="heading" style={styles.sectionHeader}>My VATSIM</ThemedText>

                <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.label}>
                    My VATSIM CID
                </ThemedText>
                <TextInput
                    style={[styles.input, {
                        borderColor: activeTheme.surface.border,
                        color: activeTheme.text.primary,
                        backgroundColor: activeTheme.surface.elevated,
                    }]}
                    value={cidInput}
                    onChangeText={setCidInput}
                    onBlur={handleCidBlur}
                    onSubmitEditing={handleCidBlur}
                    keyboardType="numeric"
                    placeholder="e.g. 1234567"
                    placeholderTextColor={activeTheme.text.muted}
                    returnKeyType="done"
                    testID="cid-input"
                />
                <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.hint}>
                    Used to highlight your aircraft on the map
                </ThemedText>

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.label}>
                    Friends' CIDs
                </ThemedText>

                {friendCids.map(cid => (
                    <View key={cid} style={styles.pillRow}>
                        <View style={styles.pill}>
                            <ThemedText variant="body-sm" color={PILOT_ROLE_COLORS.friend.dark}>{cid}</ThemedText>
                        </View>
                        <Pressable
                            onPress={() => handleRemoveFriend(cid)}
                            accessibilityLabel={`Remove friend ${cid}`}
                            testID={`remove-friend-${cid}`}
                        >
                            <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.removeBtn}>✕</ThemedText>
                        </Pressable>
                    </View>
                ))}

                <View style={styles.addRow}>
                    <TextInput
                        style={[styles.addInput, {
                            borderColor: activeTheme.surface.border,
                            color: activeTheme.text.primary,
                            backgroundColor: activeTheme.surface.elevated,
                        }]}
                        value={friendInput}
                        onChangeText={setFriendInput}
                        keyboardType="numeric"
                        placeholder="Add CID"
                        placeholderTextColor={activeTheme.text.muted}
                        returnKeyType="done"
                        onSubmitEditing={handleAddFriend}
                        testID="friend-input"
                    />
                    <Pressable
                        onPress={handleAddFriend}
                        style={[styles.addBtn, {borderColor: activeTheme.accent.primary}]}
                        testID="add-friend-btn"
                    >
                        <ThemedText variant="body-sm" color={activeTheme.accent.primary}>Add</ThemedText>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
    backBtn: {
        alignSelf: 'flex-start',
        marginBottom: 8,
        padding: 4,
    },
    sectionHeader: { marginBottom: 16 },
    label: { marginBottom: 8 },
    hint: { marginTop: 4, marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderRadius: tokens.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    divider: { height: 1, marginVertical: 16 },
    pillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    pill: {
        borderWidth: 1,
        borderColor: PILOT_ROLE_COLORS.friend.dark,
        borderRadius: tokens.radius.xl,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    removeBtn: { paddingHorizontal: 4 },
    addRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
    addInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: tokens.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    addBtn: {
        borderWidth: 1.5,
        borderRadius: tokens.radius.md,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
});

export default MyVatsimSettings;
