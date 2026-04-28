import React, { useState, useEffect, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import "../../styles/chatMdb.css";

const ChatPanelMDB = ({ type }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    
    const socketRef = useRef(null);
    const scrollRef = useRef(null);
    const selectedConvIdRef = useRef(null);

    // Helper to get current token and identity
    const getAuth = () => {
        const tokenKey = type === "user" ? "userToken" : "token_place";
        const token = localStorage.getItem(tokenKey);
        let identity = null;
        if (token) {
            try {
                // Better decode of JWT identity
                const payload = JSON.parse(atob(token.split('.')[1]));
                identity = payload.sub;
            } catch (e) {
                console.error("Error decoding token", e);
            }
        }
        return { token, identity };
    };

    const fetchMessages = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const { token } = getAuth();
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const endpoint = type === "user" ? "/api/chat/user" : "/api/chat/place";
            
            const response = await fetch(`${backendUrl}${endpoint}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages(true);

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const socket = io(backendUrl, { transports: ["polling"] });
        socketRef.current = socket;

        const { identity } = getAuth();

        socket.on("connect", () => {
            if (identity) {
                console.log("DEBUG: Joining room", `${type}_${identity}`);
                socket.emit("join", { id: identity, type: type });
            }
        });

        socket.on("new_message", (msg) => {
            console.log("DEBUG: Received new_message in socket:", msg);
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [type]);

    // Group messages into conversations
    const conversations = useMemo(() => {
        const convMap = {};
        const sorted = [...messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        sorted.forEach(msg => {
            const otherId = type === "user" ? msg.place_id : msg.user_id;
            const otherName = type === "user" ? msg.place_name : msg.user_name;
            
            if (!convMap[otherId]) {
                convMap[otherId] = {
                    id: otherId,
                    name: otherName,
                    lastMessage: msg,
                    messages: []
                };
            }
            convMap[otherId].messages.push(msg);
        });
        
        const list = Object.values(convMap);
        if (list.length > 0 && selectedConvId === null) {
            setSelectedConvId(list[0].id);
            selectedConvIdRef.current = list[0].id;
        }
        return list;
    }, [messages, type]);

    const handleSelectConversation = (id) => {
        setSelectedConvId(id);
        selectedConvIdRef.current = id;
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConvId) return;
        
        setSending(true);
        try {
            const { token } = getAuth();
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const payload = {
                message: newMessage,
                sender: type,
                [type === "user" ? "place_id" : "user_id"]: selectedConvId
            };
            
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const sentMsg = await response.json();
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedConvId, messages]);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? "Just now" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const activeConv = conversations.find(c => c.id === selectedConvId);
    const displayMessages = activeConv ? [...activeConv.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

    if (loading && messages.length === 0) {
        return (
            <div className="gradient-custom d-flex align-items-center justify-content-center">
                <div className="spinner-border text-white" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="gradient-custom">
            <div className="container py-5">
                <div className="row">
                    {/* Conversations List */}
                    <div className="col-md-6 col-lg-5 col-xl-5 mb-4 mb-md-0">
                        <h5 className="font-weight-bold mb-3 text-center text-white">
                            {type === "user" ? "Places" : "Users"}
                        </h5>
                        <div className="card mask-custom">
                            <div className="card-body">
                                <ul className="list-unstyled mb-0 chat-scroll">
                                    {conversations.map((conv) => (
                                        <li 
                                            key={conv.id} 
                                            className={`p-2 border-bottom cursor-pointer ${selectedConvId === conv.id ? 'conversation-active' : ''}`}
                                            style={{ borderBottom: "1px solid rgba(255,255,255,.1) !important" }}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            <div className="d-flex justify-content-between link-light">
                                                <div className="d-flex flex-row">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${conv.name}&background=0f172a&color=fff`} 
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-center me-3 shadow-1-strong" 
                                                        width="60" 
                                                    />
                                                    <div className="pt-1">
                                                        <p className="fw-bold mb-0 text-white">{conv.name}</p>
                                                        <p className="small text-white text-truncate" style={{ maxWidth: "150px" }}>
                                                            {conv.lastMessage.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-1 text-end">
                                                    <p className="small text-white mb-1">
                                                        {formatTime(conv.lastMessage.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                    {conversations.length === 0 && (
                                        <li className="text-center p-3 text-white-50">No messages yet.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="col-md-6 col-lg-7 col-xl-7">
                        <div className="chat-scroll pr-2" ref={scrollRef} style={{ height: "450px" }}>
                            <ul className="list-unstyled text-white">
                                {displayMessages.map((msg, index) => {
                                    const isMe = msg.sender === type;
                                    return (
                                        <li key={msg.id || index} className={`d-flex mb-4 ${isMe ? 'flex-row-reverse' : 'justify-content-between'}`}>
                                            <img 
                                                src={`https://ui-avatars.com/api/?name=${isMe ? "Me" : (type === "user" ? msg.place_name : msg.user_name)}&background=${isMe ? '0f172a' : 'cbd5e1'}&color=${isMe ? 'fff' : '0f172a'}`} 
                                                alt="avatar"
                                                className={`rounded-circle d-flex align-self-start shadow-1-strong ${isMe ? 'ms-3' : 'me-3'}`} 
                                                width="60" 
                                            />
                                            <div className="card mask-custom w-100">
                                                <div className="card-header d-flex justify-content-between p-3"
                                                    style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                                                    <p className="fw-bold mb-0">{isMe ? "Me" : (type === "user" ? msg.place_name : msg.user_name)}</p>
                                                    <p className="text-light small mb-0"><i className="far fa-clock"></i> {formatTime(msg.created_at)}</p>
                                                </div>
                                                <div className="card-body">
                                                    <p className="mb-0">{msg.message}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Input Area */}
                        {selectedConvId && (
                            <div className="mt-3">
                                <div className="form-outline form-white mb-3">
                                    <textarea 
                                        className="form-control" 
                                        rows="4"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder="Type your message..."
                                        style={{ background: "rgba(255,255,255,0.1)", color: "white", borderRadius: "1em" }}
                                    ></textarea>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn btn-light btn-lg btn-rounded float-end"
                                    onClick={handleSend}
                                    disabled={sending}
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatPanelMDB;
