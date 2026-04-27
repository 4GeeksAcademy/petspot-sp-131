import React, { useState, useEffect, useRef } from "react";
import "../../styles/chatMdb.css";

const ChatPanelMDB = ({ type }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const selectedConvIdRef = useRef(null); // Ref to avoid stale closures in setInterval

    const updateSelectedConvId = (id) => {
        setSelectedConvId(id);
        selectedConvIdRef.current = id;
    };

    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchMessages = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const tokenKey = type === "user" ? (localStorage.getItem("tokenUser") ? "tokenUser" : "userToken") : "token_place";
            const token = localStorage.getItem(tokenKey);
            
            const endpoint = type === "user" ? "/api/chat/user" : "/api/chat/place";
            
            const response = await fetch(`${backendUrl}${endpoint}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
                groupConversations(data, isInitial);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const groupConversations = (allMessages, isInitial) => {
        const convMap = {};
        const sorted = [...allMessages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        sorted.forEach(msg => {
            const otherId = type === "user" ? msg.place_id : msg.user_id;
            const otherName = type === "user" ? msg.place_name : msg.user_name;
            
            if (!convMap[otherId]) {
                convMap[otherId] = {
                    id: otherId,
                    name: otherName,
                    messages: [],
                    lastMessage: msg
                };
            }
            convMap[otherId].messages.push(msg);
        });
        
        const convList = Object.values(convMap);
        setConversations(convList);
        
        // Only set initial conversation if none is selected yet
        if (convList.length > 0 && selectedConvIdRef.current === null) {
            updateSelectedConvId(convList[0].id);
        }
    };

    useEffect(() => {
        fetchMessages(true);
        
        // Polling interval for auto-refresh (3 seconds)
        const intervalId = setInterval(() => {
            fetchMessages(false);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [type]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedConvId, messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConvId) return;
        
        setSending(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const tokenKey = type === "user" ? (localStorage.getItem("tokenUser") ? "tokenUser" : "userToken") : "token_place";
            const token = localStorage.getItem(tokenKey);
            
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
                setNewMessage("");
                await fetchMessages(false);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const activeConversation = conversations.find(c => c.id === selectedConvId);
    const displayMessages = activeConversation ? [...activeConversation.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

    if (loading && messages.length === 0) {
        return (
            <div className="gradient-custom-chat d-flex align-items-center justify-content-center">
                <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="gradient-custom-chat">
            <div className="container py-5">
                <div className="row">
                    {/* Sidebar: Conversations List */}
                    <div className="col-md-6 col-lg-5 col-xl-5 mb-4 mb-md-0">
                        <h5 className="font-weight-bold mb-3 text-center text-dark opacity-75">
                            {type === "user" ? "Mensajes con Locales" : "Mensajes de Usuarios"}
                        </h5>
                        <div className="card mask-custom">
                            <div className="card-body">
                                <ul className="list-unstyled mb-0 chat-scroll">
                                    {conversations.length === 0 && (
                                        <li className="text-dark text-center p-3 opacity-50">No hay conversaciones aún.</li>
                                    )}
                                    {conversations.map((conv) => (
                                        <li 
                                            key={conv.id} 
                                            className="p-2 border-bottom" 
                                            style={{ 
                                                borderBottom: "1px solid rgba(0,0,0,.05) !important",
                                                cursor: "pointer",
                                                backgroundColor: selectedConvId === conv.id ? "rgba(0,0,0,0.05)" : "transparent",
                                                borderRadius: "10px"
                                            }}
                                            onClick={() => updateSelectedConvId(conv.id)}
                                        >
                                            <div className="d-flex justify-content-between text-dark">
                                                <div className="d-flex flex-row">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${conv.name}&background=cbd5e1&color=0f172a`} 
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-center me-3 shadow-1-strong" 
                                                        width="60" 
                                                    />
                                                    <div className="pt-1">
                                                        <p className="fw-bold mb-0">{conv.name}</p>
                                                        <p className="small text-muted text-truncate" style={{ maxWidth: "150px" }}>
                                                            {conv.lastMessage.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-1">
                                                    <p className="small text-muted opacity-50 mb-1">
                                                        {new Date(conv.lastMessage.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="col-md-6 col-lg-7 col-xl-7">
                        <ul className="list-unstyled text-dark chat-scroll" ref={scrollRef}>
                            {displayMessages.map((msg) => {
                                const isMe = msg.sender === type;
                                return (
                                    <li key={msg.id} className={`d-flex justify-content-between mb-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${isMe ? "Yo" : (type === "user" ? msg.place_name : msg.user_name)}&background=${isMe ? '0f172a' : 'cbd5e1'}&color=${isMe ? 'fff' : '0f172a'}`} 
                                            alt="avatar"
                                            className={`rounded-circle d-flex align-self-start shadow-1-strong ${isMe ? 'ms-3' : 'me-3'}`} 
                                            width="60" 
                                        />
                                        <div className="card mask-custom w-100 shadow-sm">
                                            <div className="card-header d-flex justify-content-between p-3"
                                                style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                                                <p className="fw-bold mb-0">{isMe ? "Tú" : (type === "user" ? msg.place_name : msg.user_name)}</p>
                                                <p className="text-muted small mb-0 opacity-50">
                                                    <i className="far fa-clock"></i> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="card-body">
                                                <p className="mb-0 opacity-90">{msg.message}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                            
                            {!selectedConvId && conversations.length > 0 && (
                                <li className="text-center p-5 opacity-50">Selecciona una conversación para empezar</li>
                            )}
                            
                            {conversations.length === 0 && (
                                <li className="text-center p-5 opacity-50">No tienes mensajes todavía.</li>
                            )}
                        </ul>

                        {/* Input Area */}
                        {selectedConvId && (
                            <div className="mt-3">
                                <div className="form-outline form-white mb-3">
                                    <textarea 
                                        className="form-control bg-white text-dark shadow-sm" 
                                        style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "15px" }}
                                        id="chatInput" 
                                        rows="4"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                    ></textarea>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button 
                                        type="button" 
                                        className="btn btn-dark btn-lg px-5 shadow-sm" 
                                        style={{ borderRadius: "12px", fontWeight: "600" }}
                                        onClick={handleSend}
                                        disabled={sending}
                                    >
                                        {sending ? "..." : "Enviar"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatPanelMDB;
