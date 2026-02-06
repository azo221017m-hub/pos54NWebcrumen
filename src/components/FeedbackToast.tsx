import React, { useEffect, useState } from 'react';
import '../styles/FeedbackToast.css';

interface ToastMessage {
  id: number;
  text: string;
  variant: 'success' | 'error' | 'info';
}

// Custom event-based toast manager
class ToastManager {
  private static listeners: Set<(message: ToastMessage) => void> = new Set();

  static subscribe(callback: (message: ToastMessage) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static show(text: string, variant: 'success' | 'error' | 'info' = 'info') {
    const message: ToastMessage = {
      id: Date.now() + Math.random(),
      text,
      variant
    };
    this.listeners.forEach(listener => listener(message));
  }
}

// Export convenience methods
export const showSuccessToast = (text: string) => ToastManager.show(text, 'success');
export const showErrorToast = (text: string) => ToastManager.show(text, 'error');
export const showInfoToast = (text: string) => ToastManager.show(text, 'info');

const FeedbackToast: React.FC = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = ToastManager.subscribe((message) => {
      setMessages(prev => [...prev, message]);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
      }, 3000);
    });

    return unsubscribe;
  }, []);

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  if (messages.length === 0) return null;

  return (
    <div className="feedback-toast-container">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`feedback-toast feedback-toast-${msg.variant}`}
          onClick={() => removeMessage(msg.id)}
        >
          <div className="feedback-toast-content">
            <span className="feedback-toast-icon">
              {msg.variant === 'success' && '✓'}
              {msg.variant === 'error' && '✕'}
              {msg.variant === 'info' && 'ℹ'}
            </span>
            <span className="feedback-toast-text">{msg.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedbackToast;
