import React, { useState, useEffect } from 'react';

export function AddEventModal({ isOpen, onClose, onSave, defaultDate, initialData }) {
    const [title, setTitle] = useState('');
    const [titlePreset, setTitlePreset] = useState('МАСТЕРМАЙНД'); // Default preset
    const [subtitle, setSubtitle] = useState('');
    const [color, setColor] = useState('#F498B8');

    const PRESETS = ['МАСТЕРМАЙНД', 'ПСИХОЛОГ', 'БИЗНЕС-ВСТРЕЧА', 'Свой вариант'];

    useEffect(() => {
        if (isOpen && initialData) {
            // Check if title matches a preset
            const isPreset = PRESETS.includes(initialData.title);
            setTitlePreset(isPreset ? initialData.title : 'Свой вариант');
            setTitle(initialData.title);
            setSubtitle(initialData.subtitle || '');
            setColor(initialData.color);
        } else if (isOpen && !initialData) {
            // Defaults
            setTitlePreset('МАСТЕРМАЙНД');
            setTitle('МАСТЕРМАЙНД');
            setSubtitle('');
            setColor('#F498B8');
        }
    }, [isOpen, initialData]);

    // Handle preset change
    const handlePresetChange = (e) => {
        const val = e.target.value;
        setTitlePreset(val);
        if (val !== 'Свой вариант') {
            setTitle(val);
        } else {
            setTitle(''); // Clear for custom input
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title,
            subtitle,
            color,
            date: defaultDate
        });
        // Reset handled by effect on close/open but good practice
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Event</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <select
                            value={titlePreset}
                            onChange={handlePresetChange}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '2px solid black', fontFamily: 'var(--font-body)' }}
                        >
                            {PRESETS.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>

                        {titlePreset === 'Свой вариант' && (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Custom Title..."
                                autoFocus
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label>Subtitle</label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Topic..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            {['#F498B8', '#FCD34D', '#A7F3D0', '#BAE6FD'].map(c => (
                                <div
                                    key={c}
                                    className={`color-swatch ${color === c ? 'selected' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
