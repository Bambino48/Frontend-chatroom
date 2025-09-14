import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    IconButton,
    Text,
    Spinner,
    FormControl,
    Input,
    useToast,
    Avatar,
    Tooltip,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    HStack,
} from "@chakra-ui/react";
import {
    ArrowBackIcon,
    ArrowRightIcon,
    PhoneIcon,
    InfoOutlineIcon,
} from "@chakra-ui/icons";
import { FaSmile, FaMicrophone, FaMicrophoneSlash, FaPaperclip } from "react-icons/fa";
import Lottie from "react-lottie";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import ScrollableChat from "./ScrollableChat";
import animationData from "../animations/typing.json";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";

const ENDPOINT = "https://backend-chatroom-3.onrender.com"; // ⚠️ mets ton backend ici
let socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain, messages, setMessages }) {
    const { user, selectedChat, setSelectedChat } = ChatState();

    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const toast = useToast();

    const messagesEndRef = useRef(null);

    // Options pour Lottie (animation typing)
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    };

    // Charger les messages
    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${ENDPOINT}/api/message/${selectedChat._id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les messages.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Envoyer message
    const sendMessage = async (event) => {
        if ((event.type === "click" || event.key === "Enter") && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const { data } = await axios.post(
                    `${ENDPOINT}/api/message`,
                    { content: newMessage, chatId: selectedChat._id },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setNewMessage("");
                setMessages([...messages, data]);
                socket.emit("new message", data);
            } catch (error) {
                toast({
                    title: "Erreur",
                    description: "Impossible d'envoyer le message.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    // Upload fichier
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        toast({ title: "Upload fichier", description: file.name, status: "info" });
    };

    // Micro
    const handleMicroClick = () => {
        setIsRecording(!isRecording);
        toast({
            title: isRecording ? "Arrêt enregistrement" : "Démarrage micro",
            status: isRecording ? "warning" : "success",
        });
    };

    // Gestion saisie
    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            if (timeNow - lastTypingTime >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    // Scroll automatique
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Socket.IO connexion
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [user]);

    // Messages
    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    // Réception messages
    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (
                !selectedChatCompare ||
                selectedChatCompare._id !== newMessageReceived.chat._id
            ) {
                // TODO: notif
            } else {
                setMessages((prev) => [...prev, newMessageReceived]);
            }
        });
    });

    return (
        <>
            {selectedChat ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    width="100%"
                    height="100%"
                >
                    {/* Header */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={2}
                        borderBottom="1px solid #ccc"
                        bg="gray.100"
                    >
                        <HStack spacing={2}>
                            <Tooltip label="Retour" placement="bottom">
                                <IconButton
                                    icon={<ArrowBackIcon />}
                                    onClick={() => setSelectedChat("")}
                                    variant="ghost"
                                    aria-label="Retour"
                                    size={{ base: "sm", md: "md" }}
                                />
                            </Tooltip>
                            {selectedChat.isGroupChat ? (
                                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                                    {selectedChat.chatName}
                                </Text>
                            ) : (
                                <>
                                    <Avatar
                                        size="sm"
                                        src={
                                            selectedChat.users.find((u) => u._id !== user._id).pic
                                        }
                                    />
                                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                                        {selectedChat.users.find((u) => u._id !== user._id).name}
                                    </Text>
                                </>
                            )}
                        </HStack>
                        <HStack>
                            <IconButton
                                icon={<PhoneIcon />}
                                variant="ghost"
                                aria-label="Appel"
                                size={{ base: "sm", md: "md" }}
                            />
                            {selectedChat.isGroupChat ? (
                                <UpdateGroupChatModal
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                />
                            ) : (
                                <ProfileModal
                                    user={selectedChat.users.find((u) => u._id !== user._id)}
                                />
                            )}
                        </HStack>
                    </Box>

                    {/* Messages */}
                    <Box
                        flex="1"
                        p={4}
                        overflowY="auto"
                        bg="#f8f8f8"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent={loading ? "center" : "flex-start"}
                    >
                        {loading ? (
                            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
                        ) : (
                            <ScrollableChat
                                messages={messages}
                                user={user}
                                chat={selectedChat}
                            />
                        )}
                        {isTyping && (
                            <Box mt={2} alignSelf="flex-start">
                                <Lottie options={defaultOptions} width={70} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <FormControl isRequired mt={2} px={2} pb={{ base: 2, md: 4 }}>
                        <Box display="flex" alignItems="center" gap={2} flexWrap="nowrap">
                            {/* Fichier */}
                            <Input
                                type="file"
                                accept="image/*,audio/*,video/*,application/pdf"
                                display="none"
                                id="file-upload"
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="file-upload">
                                <IconButton
                                    as="span"
                                    icon={<FaPaperclip />}
                                    colorScheme="gray"
                                    aria-label="Ajouter un fichier"
                                    variant="ghost"
                                    size={{ base: "sm", md: "md" }}
                                />
                            </label>

                            {/* Micro */}
                            <IconButton
                                icon={isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                                colorScheme={isRecording ? "red" : "gray"}
                                aria-label="Micro"
                                variant="ghost"
                                size={{ base: "sm", md: "md" }}
                                onClick={handleMicroClick}
                            />

                            {/* Emoji */}
                            <IconButton
                                icon={<FaSmile />}
                                onClick={() => setShowEmoji(!showEmoji)}
                                colorScheme="gray"
                                variant="ghost"
                                size={{ base: "sm", md: "md" }}
                            />

                            {/* Texte */}
                            <Input
                                flex="1"
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Écrivez un message..."
                                onChange={typingHandler}
                                value={newMessage}
                                onKeyDown={sendMessage}
                                fontSize={{ base: "sm", md: "md" }}
                            />

                            {/* Envoyer */}
                            {newMessage && (
                                <IconButton
                                    colorScheme="blue"
                                    aria-label="Envoyer"
                                    icon={<ArrowRightIcon />}
                                    onClick={(e) => sendMessage({ type: "click" })}
                                    size={{ base: "sm", md: "md" }}
                                />
                            )}
                        </Box>

                        {/* Emoji Picker */}
                        {showEmoji && (
                            <Box
                                position="absolute"
                                bottom={{ base: "60px", md: "70px" }}
                                right={{ base: "10px", md: "50px" }}
                                zIndex="10"
                                maxW={{ base: "90vw", md: "300px" }}
                            >
                                <EmojiPicker
                                    width="100%"
                                    onEmojiClick={(emojiData) =>
                                        setNewMessage((prev) => prev + emojiData.emoji)
                                    }
                                />
                            </Box>
                        )}
                    </FormControl>
                </Box>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize={{ base: "lg", md: "3xl" }} pb={3}>
                        Cliquez sur un chat pour commencer
                    </Text>
                </Box>
            )}
        </>
    );
}

export default SingleChat;
