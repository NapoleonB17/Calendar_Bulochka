import React, { useState, useRef } from 'react';
import { AddEventModal } from './components/AddEventModal';
import { DuplicateModal } from './components/DuplicateModal';
import { DraggableEvent, EventSticker } from './components/DraggableEvent';
import { format, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DndContext, pointerWithin, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas';

import { CalendarGrid } from './components/CalendarGrid';
import { EventSidebar } from './components/EventSidebar';
import './index.css';

// Initial dummy events
const INITIAL_EVENTS = [
    { id: '1', date: '2026-03-05', title: 'ВЕБИНАР', subtitle: 'Как провести...', color: '#F498B8' },
    { id: '2', date: '2026-03-30', title: 'ОНЛАЙН-ПРАКТИКА', subtitle: 'По теме месяца', color: '#FCD34D' },
    { id: '10', date: 'sidebar', title: 'МАСТЕРМАЙНД', subtitle: 'Бизнес разборы в группах, работа с запросами', color: '#FCD34D' },
    { id: '11', date: 'sidebar', title: 'ПСИХОЛОГ', subtitle: 'Синдром самозванца: как перестать обесценивать себя', color: '#F498B8' },
    { id: '12', date: 'sidebar', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как выбрать прибыльную бизнес-модель на рынке в 2026 году', color: '#93C5FD' },
    { id: '13', date: 'sidebar', title: 'МАСТЕРМАЙНД', subtitle: 'Бизнес разборы в группах, работа с запросами', color: '#FCD34D' },
    { id: '14', date: 'sidebar', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'В какую нишу зайти сегодня, чтобы заработать уже завтра (с минимальными вложениями)', color: '#93C5FD' },
    { id: '15', date: 'sidebar', title: 'ПСИХОЛОГ', subtitle: 'Техника освобождения от страхов, обид и неуверенности', color: '#F498B8' },
    { id: '16', date: 'sidebar', title: 'МАСТЕРМАЙНД', subtitle: 'Бизнес разборы в группах, работа с запросами', color: '#FCD34D' },
    { id: '17', date: 'sidebar', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как протестировать бизнес-идею за 3 дня', color: '#93C5FD' },
    { id: '18', date: 'sidebar', title: 'ПСИХОЛОГ', subtitle: 'Три способа выстроить личные границы', color: '#F498B8' },
    { id: '19', date: 'sidebar', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как найти, проанализировать и утопить конкурентов', color: '#93C5FD' },
    { id: '20', date: 'sidebar', title: 'ПСИХОЛОГ', subtitle: 'Три способа выстроить личные границы', color: '#F498B8' },
    { id: '21', date: 'sidebar', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как ставить денежные цели для бизнеса и их добиваться', color: '#93C5FD' },

    // Backlog Events
    { id: 'b1', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как запустить личный бренд с нуля', color: '#93C5FD' },
    { id: 'b2', date: 'sidebar', section: 'backlog', title: 'ПСИХОЛОГ', subtitle: 'Как оставаться спокойной в стрессовых ситуациях', color: '#F498B8' },
    { id: 'b3', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Упаковка блога с нуля', color: '#93C5FD' },
    { id: 'b4', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как запустить первую рекламу своими руками', color: '#93C5FD' },
    { id: 'b5', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как продавать без стресса и напряжения. Три рабочих техники', color: '#93C5FD' },
    { id: 'b6', date: 'sidebar', section: 'backlog', title: 'ПСИХОЛОГ', subtitle: 'Как справиться с паникой, когда заканчиваются деньги', color: '#F498B8' },
    { id: 'b7', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Кого нанять в команду первыми и по какому критерию выбрать', color: '#93C5FD' },
    { id: 'b8', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как найти лучшего маркетолога, не разбираясь в маркетинге', color: '#93C5FD' },
    { id: 'b9', date: 'sidebar', section: 'backlog', title: 'ПСИХОЛОГ', subtitle: 'Как избежать эмоционального выгорания. Практики', color: '#F498B8' },
    { id: 'b10', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Как и где найти идеального ассистента', color: '#93C5FD' },
    { id: 'b11', date: 'sidebar', section: 'backlog', title: 'БИЗНЕС-ВСТРЕЧА', subtitle: 'Три модели заработка с ИИ', color: '#93C5FD' },
];

function App() {
    const [currentMonth, setCurrentMonth] = useState(new Date()); // March 2026

    // Initialize events from localStorage or default
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('calendar_events');
        return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    });

    const [history, setHistory] = useState({ past: [], future: [] });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null); // 'sidebar' or 'yyyy-MM-dd'
    const [editingEvent, setEditingEvent] = useState(null);
    const [duplicatedEvent, setDuplicatedEvent] = useState(null); // For custom modal
    const [activeId, setActiveId] = useState(null); // Track dragged item
    const calendarRef = useRef(null);

    // Persistence Effect
    React.useEffect(() => {
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }, [events]);

    // History Helper
    const updateEvents = (newEventsOrFn, addToHistory = true) => {
        setEvents(prevEvents => {
            const nextEvents = typeof newEventsOrFn === 'function'
                ? newEventsOrFn(prevEvents)
                : newEventsOrFn;

            if (addToHistory && prevEvents !== nextEvents) {
                setHistory(curr => ({
                    past: [...curr.past, prevEvents].slice(-100), // Limit to 100
                    future: []
                }));
            }
            return nextEvents;
        });
    };

    const handleUndo = () => {
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        setHistory({
            past: newPast,
            future: [events, ...history.future]
        });
        setEvents(previous);
    };

    const handleRedo = () => {
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        setHistory({
            past: [...history.past, events],
            future: newFuture
        });
        setEvents(next);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const overContainer = overId;
        const activeItem = events.find(e => e.id === activeId);
        const overItem = events.find(e => e.id === overId);

        // Check if dropped ONTO the sidebar container directly
        const isDroppedOnSidebarContainer = overContainer === 'sidebar';

        // Check if dropped ONTO an existing sidebar item
        const isDroppedOnSidebarItem = overItem && overItem.date === 'sidebar';

        // Check if dropped ONTO a calendar date
        const isDroppedOnCalendar = overContainer.match(/^\d{4}-\d{2}-\d{2}$/);

        // 1. Moving to Sidebar (Container OR Item)
        if (isDroppedOnSidebarContainer || isDroppedOnSidebarItem) {
            // If coming from Calendar (or somewhere else), FORCE it to be in sidebar
            if (activeItem.date !== 'sidebar') {
                updateEvents(prev => prev.map(e => e.id === activeId ? { ...e, date: 'sidebar', section: isDroppedOnSidebarItem ? overItem.section : undefined } : e));
                return;
            }
            // If already in sidebar, we proceed to reordering below
        }

        // 2. Moving to Calendar
        if (isDroppedOnCalendar) {
            updateEvents((prev) =>
                prev.map(e => e.id === activeId ? { ...e, date: overId, section: undefined } : e)
            );
            return;
        }

        // 3. Reorder within Sidebar
        if (activeId !== overId) {
            updateEvents((items) => {
                const oldIndex = items.findIndex((item) => item.id === activeId);
                const newIndex = items.findIndex((item) => item.id === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newItems = arrayMove(items, oldIndex, newIndex);

                    // Update section if moved to a different group
                    const overItem = items[newIndex];
                    const activeItem = items[oldIndex];

                    if (overItem && activeItem && overItem.section !== activeItem.section) {
                        newItems[newIndex] = { ...newItems[newIndex], section: overItem.section };
                    }

                    return newItems;
                }
                return items;
            });
        }
    };

    const handleDownload = async () => {
        if (calendarRef.current) {
            const canvas = await html2canvas(calendarRef.current, {
                scale: 2,
                backgroundColor: null
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `calendar-${format(currentMonth, 'MM-yyyy')}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    const handleAddEventClick = (location) => {
        setSelectedDate(location);
        setIsModalOpen(true);
    };

    const handleQuickAdd = (title) => {
        const newEvent = {
            id: Date.now().toString(),
            title: title,
            subtitle: '',
            color: '#F498B8', // Default color
            date: 'sidebar'
        };
        updateEvents([...events, newEvent]);
    };

    const handleEditEvent = (event) => {
        setSelectedDate(event.date); // Keep date context
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (eventData) => {
        if (editingEvent) {
            updateEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e));
            setEditingEvent(null);
        } else {
            const newEvent = {
                ...eventData,
                id: Date.now().toString()
            };
            updateEvents([...events, newEvent]);
        }
    };

    const handleDuplicateEvent = (event) => {
        setDuplicatedEvent(event);
    };

    const handleDuplicateConfirm = (targetDate) => {
        if (!duplicatedEvent) return;

        let targetSection = undefined;

        if (targetDate === 'sidebar') {
            if (duplicatedEvent.section === 'backlog') {
                targetSection = 'backlog';
            }
        }

        const newEvent = {
            ...duplicatedEvent,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: targetDate,
            section: targetSection
        };

        if (targetDate !== 'sidebar') {
            delete newEvent.section;
        }

        const newEvents = [...events];
        newEvents.push(newEvent);
        updateEvents(newEvents);
        setDuplicatedEvent(null);
    };

    const handleDeleteEvent = (eventId) => {
        if (window.confirm("Удалить это мероприятие?")) {
            updateEvents(events.filter(e => e.id !== eventId));
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const activeEvent = activeId ? events.find(e => e.id === activeId) : null;

    return (
        <div className="layout-wrapper">
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="sidebar-section">
                    <EventSidebar
                        events={events}
                        onAddEvent={() => handleAddEventClick('sidebar')}
                        onQuickAdd={handleQuickAdd}
                        onDeleteEvent={handleDeleteEvent}
                        onEditEvent={handleEditEvent}
                        onDuplicate={handleDuplicateEvent}
                    />
                </div>

                <div className="main-section">
                    <div className="toolbar">
                        <button onClick={prevMonth}>&lt;</button>
                        <div className="history-controls" style={{ display: 'flex', gap: '5px', margin: '0 10px' }}>
                            <button
                                onClick={handleUndo}
                                disabled={history.past.length === 0}
                                style={{ opacity: history.past.length === 0 ? 0.5 : 1, cursor: 'pointer', padding: '5px 10px', fontSize: '1rem' }}
                            >
                                ⤺ ОТМЕНА
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={history.future.length === 0}
                                style={{ opacity: history.future.length === 0 ? 0.5 : 1, cursor: 'pointer', padding: '5px 10px', fontSize: '1rem' }}
                            >
                                ⤻ ВЕРНУТЬ
                            </button>
                        </div>
                        <div style={{ flex: 1 }}></div>
                        <button onClick={nextMonth}>&gt;</button>
                        <button className="download-btn" onClick={handleDownload}>СКАЧАТЬ</button>
                    </div>

                    <div className="capture-area" ref={calendarRef}>
                        <div className="month-header-large">
                            {/* 03 Removed as requested */}
                            <span className="month-name">{format(currentMonth, 'LLLL yyyy', { locale: ru }).toUpperCase()}</span>
                            <span className="month-context">Погружение в бизнес</span>
                        </div>

                        <CalendarGrid
                            currentMonth={currentMonth}
                            events={events}
                            onAddEvent={(dateString) => handleAddEventClick(format(dateString, 'yyyy-MM-dd'))}
                            onDeleteEvent={handleDeleteEvent}
                            onEditEvent={handleEditEvent}
                            onDuplicate={handleDuplicateEvent}
                        />
                    </div>
                </div>

                <DragOverlay>
                    {activeEvent ? (
                        <EventSticker
                            title={activeEvent.title}
                            subtitle={activeEvent.subtitle}
                            color={activeEvent.color}
                            style={{ cursor: 'grabbing', transform: 'rotate(5deg) scale(1.1)' }} // Pop effect
                        />
                    ) : null}
                </DragOverlay>

            </DndContext>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
                onSave={handleSaveEvent}
                defaultDate={selectedDate === 'sidebar' ? 'sidebar' : selectedDate}
                initialData={editingEvent}
            />

            <DuplicateModal
                isOpen={!!duplicatedEvent}
                onClose={() => setDuplicatedEvent(null)}
                onConfirm={handleDuplicateConfirm}
            />
        </div>
    );
}

export default App;
