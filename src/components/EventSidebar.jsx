import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableEvent } from './DraggableEvent';
import { SortableSidebarEvent } from './SortableSidebarEvent';

export function EventSidebar({ events, onAddEvent, onDeleteEvent, onQuickAdd, onEditEvent, onDuplicate }) {
    const { setNodeRef } = useDroppable({
        id: 'sidebar',
    });

    const [inputValue, setInputValue] = React.useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onQuickAdd(inputValue.trim());
            setInputValue('');
        }
    };

    const sidebarEvents = events.filter(e => e.date === 'sidebar');
    const mainSidebarEvents = sidebarEvents.filter(e => !e.section);
    const backlogEvents = sidebarEvents.filter(e => e.section === 'backlog');

    return (
        <div className="sidebar-container" ref={setNodeRef}>
            <h2 className="sidebar-title">МЕРОПРИЯТИЯ</h2>

            <div className="sidebar-input-wrapper">
                <input
                    className="sidebar-quick-input"
                    placeholder="Впишите мероприятие..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="sidebar-list">
                <SortableContext
                    items={sidebarEvents.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {mainSidebarEvents.length === 0 && backlogEvents.length === 0 && (
                        <div className="sidebar-empty">Список пуст</div>
                    )}

                    {/* Main Events */}
                    {mainSidebarEvents.map(event => (
                        <SortableSidebarEvent
                            key={event.id}
                            id={event.id}
                            title={event.title}
                            subtitle={event.subtitle}
                            color={event.color}
                            onDelete={() => onDeleteEvent(event.id)}
                            onClick={() => onEditEvent && onEditEvent(event)}
                            onDuplicate={() => onDuplicate && onDuplicate(event)}
                        />
                    ))}

                    {/* Backlog Section */}
                    {backlogEvents.length > 0 && (
                        <>
                            <div style={{
                                borderBottom: '2px solid #000',
                                margin: '20px 0 10px 0',
                                paddingBottom: '5px',
                                fontFamily: 'var(--font-header)',
                                fontSize: '1.5rem'
                            }}>
                                БЭКЛОГ МЕРОПРИЯТИЙ
                            </div>
                            {backlogEvents.map(event => (
                                <SortableSidebarEvent
                                    key={event.id}
                                    id={event.id}
                                    title={event.title}
                                    subtitle={event.subtitle}
                                    color={event.color}
                                    onDelete={() => onDeleteEvent(event.id)}
                                    onClick={() => onEditEvent && onEditEvent(event)}
                                    onDuplicate={() => onDuplicate && onDuplicate(event)}
                                />
                            ))}
                        </>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
