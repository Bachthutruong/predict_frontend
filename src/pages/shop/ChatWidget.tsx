import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/shopServices';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [isOpen, user]);

    const fetchMessages = async () => {
        try {
            const res = await chatAPI.getHistory();
            if (res.data.success) {
                // Determine if we should scroll to bottom (only if new messages arrived)
                if (res.data.data.length > messages.length) {
                    setMessages(res.data.data);
                    scrollToBottom();
                } else {
                    setMessages(res.data.data);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            // Simple timeout to ensure render
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        setIsSending(true);
        try {
            await chatAPI.sendMessage(input);
            setInput('');
            await fetchMessages();
        } catch (error) {
            toast.error('Failed to send');
        } finally {
            setIsSending(false);
        }
    };

    if (!user) return null; // Hide if not logged in

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 text-white p-0 relative"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle className="h-7 w-7" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </Button>
            )}

            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Jiudi Support</div>
                                <div className="text-[10px] text-white/80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 text-white rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 bg-gray-50 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-xs text-gray-400 py-10">
                                    No messages yet. Start chatting with us!
                                </div>
                            )}
                            {messages.map((msg, i) => {
                                const isMe = msg.sender === user.id;
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {!isMe && <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] mr-2 mt-1 font-bold text-primary">JS</div>}
                                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border shadow-sm rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t bg-white rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 h-9 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-primary"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        // prevent IME double submission issues
                                        if (e.nativeEvent.isComposing) return;
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <Button size="icon" className="h-9 w-9 bg-primary" onClick={handleSend} disabled={!input.trim() || isSending}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
