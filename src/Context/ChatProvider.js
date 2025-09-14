import { createContext, useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [currentView, setCurrentView] = useState("chat");
    const [notification, setNotification] = useState([]);

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            setUser(userInfo);
        } else {
            // ✅ éviter de boucler si on est déjà sur la page login
            if (location.pathname !== "/") {
                history.push("/");
            }
        }
    }, [history, location.pathname]);

    return (
        <ChatContext.Provider
            value={{
                user,
                setUser,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                showFavoritesOnly,
                setShowFavoritesOnly,
                currentView,
                setCurrentView,
                notification,
                setNotification,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => useContext(ChatContext);

export default ChatProvider;
