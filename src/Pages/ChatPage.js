import { useState } from "react";
import { Box, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import UserDetailsPanel from "../components/miscellaneous/UserDetailsPanel";
import GroupDetailsPanel from "../components/miscellaneous/GroupDetailsPanel";

function ChatPage() {
    const { user, selectedChat, setSelectedChat } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const [messages, setMessages] = useState([]);
    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
        <Box width="100vw" height="100vh" overflow="hidden">
            <Box display="flex" flexDir="row" height="100%" width="100%">
                {/* ✅ Barre latérale (masquée sur mobile pour gagner de l’espace) */}
                {user && !isMobile && (
                    <Box
                        width={{ base: "0px", md: "90px" }}
                        height="100%"
                        bg="gray.50"
                        borderRight="1px solid #ccc"
                        display="flex"
                        flexDirection="column"
                    >
                        <SideDrawer />
                    </Box>
                )}

                {/* ✅ Liste des conversations */}
                {user && (!isMobile || !selectedChat) && (
                    <Box
                        width={{ base: "100%", md: "350px" }}
                        height="100%"
                        bg="white"
                        borderRight={{ base: "none", md: "1px solid #ccc" }}
                        overflowY="auto"
                        display="flex"
                        flexDirection="column"
                    >
                        <MyChats fetchAgain={fetchAgain} />
                    </Box>
                )}

                {/* ✅ Zone de chat */}
                {user && (!isMobile || selectedChat) && (
                    <Box
                        flex="1"
                        height="100%"
                        bg="gray.100"
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                        position="relative"
                    >
                        {/* Bouton retour visible uniquement sur mobile */}
                        {isMobile && selectedChat && (
                            <IconButton
                                icon={<ArrowBackIcon />}
                                position="absolute"
                                top="2"
                                left="2"
                                size="sm"
                                borderRadius="full"
                                onClick={() => setSelectedChat(null)}
                                aria-label="Revenir aux conversations"
                            />
                        )}

                        <ChatBox
                            fetchAgain={fetchAgain}
                            setFetchAgain={setFetchAgain}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </Box>
                )}

                {/* ✅ Détails utilisateur ou groupe (uniquement en md+) */}
                {user && !isMobile && selectedChat && (
                    <Box
                        width="300px"
                        height="100%"
                        bg="white"
                        borderLeft="1px solid #ccc"
                        overflowY="auto"
                        display="flex"
                        flexDirection="column"
                    >
                        {selectedChat.isGroupChat ? (
                            <GroupDetailsPanel chat={selectedChat} messages={messages} />
                        ) : (
                            selectedChat.users && (
                                <UserDetailsPanel
                                    user={selectedChat.users.find((u) => u._id !== user._id)}
                                    messages={messages}
                                    selectedChat={selectedChat}
                                />
                            )
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default ChatPage;
