import { useState } from "react";
import { Box, useBreakpointValue, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import UserDetailsPanel from "../components/miscellaneous/UserDetailsPanel";
import GroupDetailsPanel from "../components/miscellaneous/GroupDetailsPanel";

function ChatPage() {
    const { user, selectedChat } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const [messages, setMessages] = useState([]);
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box width="100vw" height="100vh" overflow="hidden">
            <Box display="flex" flexDir="row" height="100%" width="100%">
                {/* ✅ Sidebar desktop fixe */}
                {user && !isMobile && (
                    <Box
                        width="90px"
                        height="100%"
                        bg="gray.50"
                        borderRight="1px solid #ccc"
                        display="flex"
                        flexDirection="column"
                    >
                        <SideDrawer />
                    </Box>
                )}

                {/* ✅ Bouton menu mobile */}
                {user && isMobile && (
                    <Box
                        position="absolute"
                        top="2"
                        left="2"
                        zIndex="10"
                    >
                        <IconButton
                            icon={<HamburgerIcon />}
                            size="md"
                            onClick={onOpen}
                            aria-label="Menu"
                        />
                        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerCloseButton />
                                <SideDrawer />
                            </DrawerContent>
                        </Drawer>
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
                        <ChatBox
                            fetchAgain={fetchAgain}
                            setFetchAgain={setFetchAgain}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </Box>
                )}

                {/* ✅ Détails utilisateur ou groupe (uniquement desktop) */}
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
