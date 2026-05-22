import AsyncStorage from '@react-native-async-storage/async-storage';

export const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "LOGIN":
            AsyncStorage.setItem("tokens", JSON.stringify({
                access_token: action.payload.access_token,
                refresh_token: action.payload.refresh_token,
            }));
            return action.payload;

        case "LOGOUT":
            AsyncStorage.removeItem("tokens");
            return null;

        case "REFRESH_TOKEN":
            AsyncStorage.setItem("tokens", JSON.stringify({
                access_token: action.payload.access_token,
                refresh_token: action.payload.refresh_token,
            }));
            return { ...current, ...action.payload };

        case "UPDATE_AVATAR":
            return { ...current, avatar: action.payload.uri };
    }
    return current;
};