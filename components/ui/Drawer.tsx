"use client"

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { cn } from '@/lib/utils'

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
}

interface DrawerTitleProps {
  children: React.ReactNode;
}

interface DrawerSubtitleProps {
  children: React.ReactNode;
}

interface DrawerContentProps {
  children: React.ReactNode;
}

const DrawerTitle: React.FC<DrawerTitleProps> = ({ children }) => (
  <h2 className="text-sm font-semibold mb-2 text-foreground">{children}</h2>
);

const DrawerSubtitle: React.FC<DrawerSubtitleProps> = ({ children }) => (
  <p className="text-xs text-muted-foreground mb-4">{children}</p>
);

const DrawerContent: React.FC<DrawerContentProps> = ({ children }) => (
  <div className="flex-1 overflow-y-auto">{children}</div>
);

const getDrawerClasses = (placement: string, visible: boolean) => {
  const baseClasses = "fixed border-border transition-transform duration-300 ease-out z-[9999]";
  
  switch (placement) {
    case 'top':
      return `${baseClasses} top-0 left-0 right-0 h-96 border-b transform ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`;
    case 'bottom':
      return `${baseClasses} bottom-0 left-0 right-0 h-96 border-t transform ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`;
    case 'left':
      return `${baseClasses} top-0 left-0 bottom-0 w-96 border-r transform ${
        visible ? 'translate-x-0' : '-translate-x-full'
      }`;
    case 'right':
    default:
      return `${baseClasses} top-0 right-0 bottom-0 w-96 border-l transform ${
        visible ? 'translate-x-0' : 'translate-x-full'
      }`;
  }
};

export const Drawer: React.FC<DrawerProps> & {
  Title: React.FC<DrawerTitleProps>;
  Subtitle: React.FC<DrawerSubtitleProps>;
  Content: React.FC<DrawerContentProps>;
} = ({ visible, onClose, placement = 'right', children, overlayClassName, overlayStyle }) => {
  const drawerRef = useClickOutside<HTMLDivElement>(() => {
    if (visible) onClose();
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  const drawerContent = (
    <>
      {/* Overlay */}
      <div 
        className={cn("fixed inset-0 bg-foreground/60 backdrop-blur-md z-[9998] transition-all duration-300", overlayClassName)}
        onClick={onClose}
        style={overlayStyle}
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={getDrawerClasses(placement, visible)}
      >
        <div className="flex flex-col h-full p-4 bg-card shadow-2xl border-l border-border relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
          
          {/* Content */}
          <div className="flex flex-col h-full pr-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  // Render drawer in a portal to escape stacking context
  return typeof window !== 'undefined' 
    ? createPortal(drawerContent, document.body)
    : drawerContent;
};

Drawer.Title = DrawerTitle;
Drawer.Subtitle = DrawerSubtitle;
Drawer.Content = DrawerContent;
