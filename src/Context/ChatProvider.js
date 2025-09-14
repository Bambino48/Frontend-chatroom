import { createContext, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [currentView, setCurrentView] = useState("chat");
    const [notification, setNotification] = useState([]);

    const history = useHistory();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUser(userInfo);

        if (!userInfo) {
            history.push("/"); // redirection vers login
        }
    }, [history]);

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
                setNotification
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => useContext(ChatContext);

export default ChatProvider;
