import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDroppable } from '@dnd-kit/core';

import { DraggableEvent } from './DraggableEvent';

// Week days for header
const WEEKDAYS = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ'];

export function CalendarGrid({ currentMonth, events, onAddEvent, onDeleteEvent, setNodeRef, onEditEvent, onDuplicate }) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    return (
        <div className="calendar-container" ref={setNodeRef}>
            {/* Weekday Headers */}
            <div className="calendar-header">
                {WEEKDAYS.map((day, index) => (
                    <div key={day} className={`weekday-header ${index >= 5 ? 'weekend' : ''}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="calendar-grid">
                {calendarDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    // Filter out 'sidebar' events before checking date equality to avoid Invalid Date errors
                    const dayEvents = events.filter(e =>
                        e.date !== 'sidebar' && isSameDay(new Date(e.date), day)
                    );

                    return (
                        <CalendarDay
                            key={dateKey}
                            date={day}
                            isCurrentMonth={isSameMonth(day, monthStart)}
                            events={dayEvents}
                            onAddEvent={() => onAddEvent(day)}
                            onDeleteEvent={onDeleteEvent}
                            onEditEvent={onEditEvent}
                            onDuplicate={onDuplicate}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function CalendarDay({ date, isCurrentMonth, events, onAddEvent, onDeleteEvent, onEditEvent, onDuplicate }) {
    const { setNodeRef } = useDroppable({
        id: format(date, 'yyyy-MM-dd'),
    });

    if (!isCurrentMonth) {
        return <div className="calendar-day empty"></div>;
    }

    return (
        <div ref={setNodeRef} className="calendar-day" onClick={onAddEvent}>
            <span className="day-number">{format(date, 'dd')}</span>

            <div className="events-list">
                {events.map(event => (
                    <DraggableEvent
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        subtitle={event.subtitle}
                        color={event.color}
                        onDelete={() => onDeleteEvent && onDeleteEvent(event.id)}
                        onClick={() => onEditEvent && onEditEvent(event)}
                        onDuplicate={() => onDuplicate && onDuplicate(event)}
                    />
                ))}
            </div>
        </div >
    );
}
