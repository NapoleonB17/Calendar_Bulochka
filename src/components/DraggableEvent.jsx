import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const EventSticker = React.forwardRef(({ title, subtitle, color, onDelete, style, ...props }, ref) => {
    const isPsychologist = title.toUpperCase().includes('ПСИХОЛОГ');
    const isBusiness = title.toUpperCase().includes('БИЗНЕС');

    return (
        <div
            ref={ref}
            style={{ ...style, backgroundColor: color }}
            className="event-sticker"
            {...props}
        >
            <div className="event-title">{title}</div>

            {isPsychologist && (
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    border: '1px solid #000',
                    zIndex: 5,
                    overflow: 'hidden'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#000" />
                    </svg>
                </div>
            )}

            {isBusiness && (
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    border: '1px solid #000',
                    zIndex: 5,
                    overflow: 'hidden',
                    padding: '3px'
                }}>
                    {/* Dollar Bill Icon */}
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#16a34a" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="3" stroke="#16a34a" strokeWidth="2" />
                        <line x1="6" y1="12" x2="6.01" y2="12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                        <line x1="18" y1="12" x2="18.01" y2="12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>
            )}

            {subtitle && <div className="event-subtitle">{subtitle}</div>}

            {/* Duplicate Button */}
            <button className="duplicate-btn"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    props.onDuplicate && props.onDuplicate();
                }}
            >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>

            <button className="delete-btn"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(e);
                }}
            >×</button>
        </div>
    );
});

export function DraggableEvent({ id, title, subtitle, color, onDelete, onClick, ...props }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1, // Visual feedback when dragging original
    };

    return (
        <EventSticker
            ref={setNodeRef}
            style={style}
            color={color}
            title={title}
            subtitle={subtitle}
            onDelete={onDelete}
            onClick={onClick}
            {...listeners}
            {...attributes}
            {...props}
        />
    );
}
