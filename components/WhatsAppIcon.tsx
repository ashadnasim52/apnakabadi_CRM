import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppIconProps {
  phone: string;
  className?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ phone, className = '' }) => {
  if (!phone) return null;
  
  // Clean phone number: remove non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  return (
    <a 
      href={`https://wa.me/${cleanPhone}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`inline-flex items-center justify-center text-green-500 hover:text-green-600 transition-colors ${className}`}
      title="Chat on WhatsApp"
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle size={14} />
    </a>
  );
};
