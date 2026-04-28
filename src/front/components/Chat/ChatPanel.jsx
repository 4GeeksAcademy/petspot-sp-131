import React, { useState, useEffect, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const ChatPanel = ({ type }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    
    const socketRef = useRef(null);
    const scrollRef = useRef(null);
    const selectedConvIdRef = useRef(null);

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
                socket.emit("join", { id: identity, type: type });
            }
        });

        socket.on("new_message", (msg) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [type]);

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
        return isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const activeConv = conversations.find(c => c.id === selectedConvId);
    const displayMessages = activeConv ? [...activeConv.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

    if (loading && messages.length === 0) {
        return <div className="text-center p-5">Loading chats...</div>;
    }

    return (
        <div className="container py-4">
            <div className="row g-0 shadow-lg rounded-4 overflow-hidden" style={{ height: "70vh", border: "1px solid #eee" }}>
                {/* Sidebar */}
                <div className="col-4 bg-white border-end">
                    <div className="p-3 bg-light border-bottom">
                        <h5 className="mb-0 fw-bold">Messages</h5>
                    </div>
                    <div className="overflow-auto" style={{ height: "calc(100% - 60px)" }}>
                        {conversations.map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => { setSelectedConvId(conv.id); selectedConvIdRef.current = conv.id; }}
                                className={`p-3 border-bottom cursor-pointer hover-bg-light ${selectedConvId === conv.id ? "bg-primary-subtle" : ""}`}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 45, height: 45 }}>
                                        {conv.name.charAt(0)}
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0 text-truncate fw-bold">{conv.name}</h6>
                                            <small className="text-muted">{formatTime(conv.lastMessage.created_at)}</small>
                                        </div>
                                        <p className="mb-0 text-muted small text-truncate">{conv.lastMessage.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {conversations.length === 0 && <div className="p-4 text-center text-muted">No conversations yet</div>}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="col-8 bg-white d-flex flex-column">
                    {activeConv ? (
                        <>
                            <div className="p-3 border-bottom bg-light d-flex align-items-center">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40 }}>
                                    {activeConv.name.charAt(0)}
                                </div>
                                <h6 className="mb-0 fw-bold">{activeConv.name}</h6>
                            </div>
                            
                            <div className="flex-grow-1 p-4 overflow-auto bg-light-subtle" ref={scrollRef}>
                                {displayMessages.map((msg, idx) => {
                                    const isMe = msg.sender === type;
                                    return (
                                        <div key={msg.id || idx} className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                                            <div className={`p-3 rounded-4 shadow-sm ${isMe ? "bg-primary text-white rounded-bottom-end-0" : "bg-white rounded-bottom-start-0"}`} style={{ maxWidth: "75%" }}>
                                                <p className="mb-1">{msg.message}</p>
                                                <div className={`text-end small ${isMe ? "text-white-50" : "text-muted"}`} style={{ fontSize: "0.7rem" }}>
                                                    {formatTime(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-3 border-top bg-white">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control border-0 bg-light-subtle" 
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button className="btn btn-primary px-4" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center mt-4">
                <Link to={type === "user" ? "/user/private" : "/place/private"} className="btn btn-outline-secondary">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default ChatPanel;
