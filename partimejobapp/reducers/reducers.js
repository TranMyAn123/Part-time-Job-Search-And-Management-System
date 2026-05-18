export const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "LOGIN":
            return action.payload;
        case "LOGOUT":
            return null;
        case "UPDATE_AVATAR":
            return { ...current, avatar: action.payload.uri };
    }

    return current;
}