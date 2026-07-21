'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, MessageSquareHeart } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn, getInitials } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function GroupChat({ groupId }: { groupId: string }) {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar historial inicial
  useEffect(() => {
    apiClient.get(`/groups/${groupId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages:', err));
  }, [groupId]);

  // 2. Conectar a WebSocket
  useEffect(() => {
    const socketUrl = API_BASE_URL.replace('/api', '') + '/chat';
    const newSocket = io(socketUrl, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joinGroup', { groupId });
    });

    newSocket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      
      // Notificar si no es mío
      if (msg.senderId !== user?.id) {
        addToast({ message: `Nuevo mensaje de ${msg.sender.name}`, type: 'success' });
      }
    });

    return () => {
      newSocket.emit('leaveGroup', { groupId });
      newSocket.disconnect();
    };
  }, [groupId, user?.id, addToast]);

  // Scroll automático hacia abajo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !user) return;

    const newMsgContent = inputValue.trim();
    
    // Optimistic update
    const optimisticMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      groupId,
      senderId: user.id,
      content: newMsgContent,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }
    };
    
    // Solo agregamos si no existe ya para evitar duplicados en caso de que el backend envíe inmediatamente
    setMessages(prev => {
      if (prev.some(m => m.id === optimisticMsg.id)) return prev;
      return [...prev, optimisticMsg];
    });

    socket.emit('sendMessage', {
      groupId,
      userId: user.id,
      content: newMsgContent
    });
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-[65vh] bg-surface-2/40 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative ring-1 ring-white/5">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Zona de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-pulse">
              <MessageSquareHeart size={32} />
            </div>
            <h3 className="font-syne font-bold text-text-primary text-lg mb-1">El chat está muy tranquilo</h3>
            <p className="font-dm text-sm text-text-secondary max-w-[250px]">
              Sé el primero en romper el hielo y saluda a los integrantes del grupo.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.id;
              const prevMsg = messages[idx - 1];
              const showAvatar = !isMe && prevMsg?.senderId !== msg.senderId;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    'flex w-full gap-2',
                    isMe ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isMe && (
                    <div className="w-8 flex-shrink-0 flex items-end">
                      {showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-sm border-2 border-surface">
                          {msg.sender.avatar ? (
                            <img src={msg.sender.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-syne font-bold text-white">
                              {getInitials(msg.sender.name)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={cn('flex flex-col max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                    {showAvatar && (
                      <span className="text-[11px] font-medium text-text-secondary ml-1 mb-1 font-dm">
                        {msg.sender.name}
                      </span>
                    )}
                    <div
                      className={cn(
                        'px-4 py-3 text-sm font-dm shadow-lg transition-transform hover:scale-[1.02]',
                        isMe 
                          ? 'bg-gradient-to-br from-primary to-accent text-white rounded-2xl rounded-br-sm shadow-primary/20' 
                          : 'bg-surface border border-white/5 text-text-primary rounded-2xl rounded-bl-sm shadow-black/20'
                      )}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-text-secondary/60 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Input Glassmorphism */}
      <div className="p-4 bg-surface/80 backdrop-blur-md border-t border-white/5 relative z-10">
        <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all shadow-inner">
          <button className="p-2.5 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface-2">
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent px-2 py-2 text-sm font-dm focus:outline-none text-text-primary placeholder:text-text-secondary/50"
          />
          <motion.button
            whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
            whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              "p-3 rounded-full transition-all flex items-center justify-center shadow-lg",
              inputValue.trim() 
                ? "bg-primary text-white shadow-primary/30" 
                : "bg-surface-2 text-text-secondary border border-white/5 opacity-70"
            )}
          >
            <Send size={18} className={inputValue.trim() ? "translate-x-[-1px]" : ""} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
