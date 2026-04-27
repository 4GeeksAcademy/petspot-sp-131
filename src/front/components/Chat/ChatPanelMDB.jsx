import React, { useState, useEffect, useRef } from "react";
import "../../styles/chatMdb.css";

const ChatPanelMDB = ({ type }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    
    const scrollRef = useRef(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
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
                groupConversations(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const groupConversations = (allMessages) => {
        const convMap = {};
        
        // Sort by date desc to get last message easily
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
        
        if (convList.length > 0 && !selectedConvId) {
            setSelectedConvId(convList[0].id);
        }
    };

    useEffect(() => {
        fetchMessages();
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
                await fetchMessages();
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
                <div className="spinner-border text-light" role="status">
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
                        <h5 className="font-weight-bold mb-3 text-center text-white">
                            {type === "user" ? "Mis Conversaciones" : "Mensajes de Usuarios"}
                        </h5>
                        <div className="card mask-custom">
                            <div className="card-body">
                                <ul className="list-unstyled mb-0 chat-scroll">
                                    {conversations.length === 0 && (
                                        <li className="text-white text-center p-3">No hay conversaciones aún.</li>
                                    )}
                                    {conversations.map((conv) => (
                                        <li 
                                            key={conv.id} 
                                            className="p-2 border-bottom" 
                                            style={{ 
                                                borderBottom: "1px solid rgba(255,255,255,.3) !important",
                                                cursor: "pointer",
                                                backgroundColor: selectedConvId === conv.id ? "rgba(255,255,255,0.1)" : "transparent"
                                            }}
                                            onClick={() => setSelectedConvId(conv.id)}
                                        >
                                            <div className="d-flex justify-content-between link-light">
                                                <div className="d-flex flex-row">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${conv.name}&background=random`} 
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
                                                <div className="pt-1">
                                                    <p className="small text-white mb-1">
                                                        {new Date(conv.lastMessage.created_at).toLocaleDateString()}
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
                        <ul className="list-unstyled text-white chat-scroll" ref={scrollRef}>
                            {displayMessages.map((msg) => {
                                const isMe = msg.sender === type;
                                return (
                                    <li key={msg.id} className={`d-flex justify-content-between mb-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${isMe ? "Yo" : (type === "user" ? msg.place_name : msg.user_name)}&background=${isMe ? '39FF14' : 'random'}`} 
                                            alt="avatar"
                                            className={`rounded-circle d-flex align-self-start shadow-1-strong ${isMe ? 'ms-3' : 'me-3'}`} 
                                            width="60" 
                                        />
                                        <div className="card mask-custom w-100">
                                            <div className="card-header d-flex justify-content-between p-3"
                                                style={{ borderBottom: "1px solid rgba(255,255,255,.3)" }}>
                                                <p className="fw-bold mb-0">{isMe ? "Tú" : (type === "user" ? msg.place_name : msg.user_name)}</p>
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
                                <li className="text-center p-5">Selecciona una conversación para empezar</li>
                            )}
                            
                            {conversations.length === 0 && (
                                <li className="text-center p-5">No tienes mensajes todavía. ¡Contacta con un local para empezar!</li>
                            )}
                        </ul>

                        {/* Input Area */}
                        {selectedConvId && (
                            <div className="mt-3">
                                <div className="form-outline form-white mb-3">
                                    <textarea 
                                        className="form-control bg-transparent text-white border-white" 
                                        style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                                        id="chatInput" 
                                        rows="4"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                    ></textarea>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button 
                                        type="button" 
                                        className="btn btn-light btn-lg btn-rounded"
                                        onClick={fetchMessages}
                                    >
                                        GET CHAT
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary btn-lg btn-rounded" 
                                        style={{ backgroundColor: "#39FF14", borderColor: "#39FF14", color: "#000" }}
                                        onClick={handleSend}
                                        disabled={sending}
                                    >
                                        {sending ? "..." : "SEND"}
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
