import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EventSticker } from './DraggableEvent';

export function SortableSidebarEvent({ id, title, subtitle, color, onDelete, onClick, onDuplicate }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    // Use Translate to avoid messing up the rotation in the child
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Keep slightly visible to maintain layout flow visual cue? Or 0.
        // If 0, the list collapses? No, Sortable manages placeholders.
        // Let's keep it 0 but ensure dimensions are locked.
        position: 'relative',
        zIndex: isDragging ? 999 : 1, // Bring to front when dragging
        touchAction: 'none',
        height: isDragging ? 'auto' : 'auto', // Ensure height doesn't collapse
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            < EventSticker
                color={color}
                title={title}
                subtitle={subtitle}
                onDelete={onDelete}
                onClick={onClick}
                onDuplicate={onDuplicate}
                style={{ cursor: 'grab', width: '100%' }}
            />
        </div>
    );
}
