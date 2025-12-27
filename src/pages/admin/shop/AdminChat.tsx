import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../../services/shopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { MessageCircle, Send, Search, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    lastMessage?: {
        content: string;
        createdAt: string;
        read: boolean;
        isAdmin: boolean;
    };
}

interface Message {
    _id: string;
    sender: string;
    receiver: string | null;
    isAdmin: boolean;
    content: string;
    read: boolean;
    createdAt: string;
}

export default function AdminChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
            const interval = setInterval(() => fetchMessages(selectedUser._id), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    const fetchConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load conversations', error);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const res = await chatAPI.getAdminChat(userId);
            if (res.data.success) {
                setMessages(res.data.data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async () => {
        if (!input.trim() || !selectedUser || isSending) return;
        setIsSending(true);
        try {
            await chatAPI.sendAdminMessage(selectedUser._id, input);
            setInput('');
            await fetchMessages(selectedUser._id);
            await fetchConversations();
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-7 w-7 text-primary" />
                    Customer Support Chat
                </h1>
                <p className="text-gray-500 mt-1">Manage conversations with customers</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="flex h-full">
                    {/* Conversations List */}
                    <div className="w-80 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No conversations yet</p>
                                </div>
                            ) : (
                                filteredConversations.map(conv => (
                                    <div
                                        key={conv._id}
                                        onClick={() => setSelectedUser(conv)}
                                        className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${selectedUser?._id === conv._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                {conv.avatar ? (
                                                    <img src={conv.avatar} alt={conv.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-sm text-gray-900 truncate">{conv.name}</h3>
                                                    {conv.lastMessage && (
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{conv.email}</p>
                                                {conv.lastMessage && (
                                                    <p className={`text-xs mt-1 truncate ${!conv.lastMessage.read && !conv.lastMessage.isAdmin ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                        {conv.lastMessage.isAdmin && <span className="text-primary">You: </span>}
                                                        {conv.lastMessage.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedUser ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        {selectedUser.avatar ? (
                                            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50">
                                    <div className="space-y-4">
                                        {messages.length === 0 && (
                                            <div className="text-center text-gray-400 py-10">
                                                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No messages yet</p>
                                            </div>
                                        )}
                                        {messages.map((msg, i) => {
                                            const isAdmin = msg.isAdmin;
                                            return (
                                                <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] p-3 rounded-2xl ${isAdmin ? 'bg-primary text-white rounded-br-none' : 'bg-white border shadow-sm rounded-bl-none'}`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={scrollRef} />
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t bg-white">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    if (e.nativeEvent.isComposing) return;
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                        />
                                        <Button onClick={handleSend} disabled={!input.trim() || isSending} className="bg-primary">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Select a conversation</p>
                                    <p className="text-sm mt-1">Choose a customer to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
