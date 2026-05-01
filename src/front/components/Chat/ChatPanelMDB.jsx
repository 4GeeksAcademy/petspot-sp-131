import React, { useState, useEffect, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import "../../styles/chatMdb.css";

const ChatPanelMDB = ({ type }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const location = useLocation();
    
    // Parse URL params for pre-selected chat
    const queryParams = new URLSearchParams(location.search);
    const preSelectedId = queryParams.get("id") ? Number(queryParams.get("id")) : null;
    const preSelectedName = queryParams.get("name") || "Nuevo Chat";
    
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
                identity = JSON.parse(atob(token.split('.')[1])).sub;
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
                
                // Calculate initial unread counts
                const counts = {};
                data.forEach(msg => {
                    if (!msg.is_read && msg.sender !== type) {
                        const otherId = type === "user" ? msg.place_id : msg.user_id;
                        counts[otherId] = (counts[otherId] || 0) + 1;
                    }
                });
                setUnreadCounts(counts);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const markAsRead = async (otherId) => {
        try {
            const { token } = getAuth();
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            await fetch(`${backendUrl}/api/chat/read`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ other_id: otherId, type: type })
            });
            
            // Update local state
            setUnreadCounts(prev => ({ ...prev, [otherId]: 0 }));
            setMessages(prev => prev.map(msg => {
                const msgOtherId = type === "user" ? msg.place_id : msg.user_id;
                if (msgOtherId === otherId && msg.sender !== type) {
                    return { ...msg, is_read: true };
                }
                return msg;
            }));
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    useEffect(() => {
        fetchMessages(true);

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        console.log("DEBUG: Connecting to socket (Polling only) at", backendUrl);
        const socket = io(backendUrl, { transports: ["polling"] });
        socketRef.current = socket;

        const { identity } = getAuth();
        console.log("DEBUG: My identity is", identity, "type", type);

        socket.on("connect", () => {
            console.log("DEBUG: Socket connected! ID:", socket.id);
            if (identity) {
                socket.emit("join", { id: identity, type: type });
                console.log("DEBUG: Sent join event for", identity);
            }
        });

        socket.on("reconnect", () => {
            console.log("DEBUG: Socket reconnected!");
            if (identity) {
                socket.emit("join", { id: identity, type: type });
            }
        });

        socket.on("connect_error", (err) => {
            console.error("DEBUG: Socket connection error:", err);
        });

        socket.on("new_message", (msg) => {
            console.log("DEBUG: Received new_message:", msg);
            const otherId = type === "user" ? msg.place_id : msg.user_id;
            
            setMessages(prev => {
                // If the message already exists (e.g. arrived very fast), don't add it again
                if (prev.some(m => m.id === msg.id)) return prev;
                // Add the new message and sort by date to be safe
                return [...prev, msg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });

            // Increment unread count if message is not for the active conversation
            if (msg.sender !== type) {
                if (otherId !== selectedConvIdRef.current) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [otherId]: (prev[otherId] || 0) + 1
                    }));
                } else {
                    // If it is the active conversation, mark as read immediately
                    markAsRead(otherId);
                }
            }
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

        // If we have a pre-selected ID but no messages yet, add a dummy conversation to the list
        if (preSelectedId && !convMap[preSelectedId]) {
            list.push({
                id: preSelectedId,
                name: preSelectedName,
                lastMessage: { message: "Escribe el primer mensaje...", created_at: new Date().toISOString() },
                messages: []
            });
        }

        if (list.length > 0 && selectedConvId === null) {
            const initialId = preSelectedId || list[0].id;
            setSelectedConvId(initialId);
            selectedConvIdRef.current = initialId;
            markAsRead(initialId);
        }
        return list;
    }, [messages, type, preSelectedId, preSelectedName]);

    const handleSelectConversation = (id) => {
        setSelectedConvId(id);
        selectedConvIdRef.current = id;
        markAsRead(id);
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
            console.log("DEBUG: Sending message with payload:", payload);
            
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                // We don't add it manually here because the SocketIO listener 
                // will catch the 'new_message' event that the backend emits to our room.
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

    const activeConv = conversations.find(c => c.id === selectedConvId);
    const displayMessages = activeConv ? [...activeConv.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

    if (loading && messages.length === 0) {
        return (
            <div className="gradient-custom d-flex align-items-center justify-content-center">
                <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="gradient-custom">
            <div className="container py-5">
                <div className="row">
                    {/* Conversations List (Left Column) */}
                    <div className="col-md-6 col-lg-5 col-xl-5 mb-4 mb-md-0">
                        <h5 className="font-weight-bold mb-3 text-center text-white">
                            {type === "user" ? "Locales" : "Usuarios"}
                        </h5>
                        <div className="card mask-custom">
                            <div className="card-body">
                                <ul className="list-unstyled mb-0 chat-scroll">
                                    {conversations.map((conv) => (
                                        <li 
                                            key={conv.id} 
                                            className={`p-2 border-bottom ${selectedConvId === conv.id ? 'conversation-active' : ''}`}
                                            style={{ borderBottom: "1px solid rgba(255,255,255,.3) !important", cursor: "pointer" }}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            <a href="#!" className="d-flex justify-content-between link-light">
                                                <div className="d-flex flex-row">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${conv.name}&background=0f172a&color=fff`} 
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-center me-3 shadow-1-strong" 
                                                        width="60" 
                                                    />
                                                    <div className="pt-1">
                                                        <p className="fw-bold mb-0">{conv.name}</p>
                                                        <p className="small text-white text-truncate" style={{ maxWidth: "150px" }}>
                                                            {conv.lastMessage.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-1 text-end">
                                                    <p className="small text-white mb-1">
                                                        {new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {unreadCounts[conv.id] > 0 && (
                                                        <span className="badge bg-danger float-end">{unreadCounts[conv.id]}</span>
                                                    )}
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                    {conversations.length === 0 && (
                                        <li className="text-center p-3 text-white opacity-50">No hay mensajes aún.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chat Window (Right Column) */}
                    <div className="col-md-6 col-lg-7 col-xl-7">
                        <ul className="list-unstyled text-white chat-scroll pr-2" ref={scrollRef} style={{ height: "450px", overflowY: "auto" }}>
                            {displayMessages.map((msg, index) => {
                                const isMe = msg.sender === type;
                                const senderName = isMe ? "Yo" : (type === "user" ? msg.place_name : msg.user_name);
                                
                                return (
                                    <li key={msg.id || index} className={`d-flex justify-content-between mb-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${senderName}&background=${isMe ? '0f172a' : 'cbd5e1'}&color=${isMe ? 'fff' : '0f172a'}`} 
                                            alt="avatar"
                                            className={`rounded-circle d-flex align-self-start shadow-1-strong ${isMe ? 'ms-3' : 'me-3'}`} 
                                            width="60" 
                                        />
                                        <div className="card mask-custom w-100">
                                            <div className="card-header d-flex justify-content-between p-3"
                                                style={{ borderBottom: "1px solid rgba(255,255,255,.3)" }}>
                                                <p className="fw-bold mb-0">{senderName}</p>
                                                <p className="text-light small mb-0">
                                                    <i className="far fa-clock"></i> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="card-body">
                                                <p className="mb-0">{msg.message}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                            {!selectedConvId && conversations.length > 0 && (
                                <li className="text-center p-5 text-white opacity-50">Selecciona un chat para empezar</li>
                            )}
                            {selectedConvId && displayMessages.length === 0 && (
                                <li className="text-center p-5 text-white opacity-50">Escribe el primer mensaje...</li>
                            )}
                        </ul>

                        {/* Input Area */}
                        {selectedConvId && (
                            <div className="mt-3">
                                <div data-mdb-input-init className="form-outline form-white mb-3">
                                    <textarea 
                                        className="form-control" 
                                        id="textAreaExample3" 
                                        rows="4"
                                        style={{ background: "rgba(255,255,255,0.1)", color: "white", borderRadius: "1em" }}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder="Escribe tu mensaje..."
                                    ></textarea>
                                    <label className="form-label text-white" htmlFor="textAreaExample3">Mensaje</label>
                                </div>
                                <button 
                                    type="button" 
                                    data-mdb-button-init 
                                    data-mdb-ripple-init 
                                    className="btn btn-light btn-lg btn-rounded float-end"
                                    onClick={handleSend}
                                    disabled={sending || !newMessage.trim()}
                                >
                                    {sending ? "Enviando..." : "Enviar"}
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
