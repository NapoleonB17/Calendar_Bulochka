import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function DuplicateModal({ isOpen, onClose, onConfirm }) {
    const [step, setStep] = useState('choice'); // 'choice' | 'date'
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        if (isOpen) {
            setStep('choice');
            setDate(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChoice = (choice) => {
        if (choice === 'sidebar') {
            onConfirm('sidebar');
            onClose();
        } else {
            setStep('date');
        }
    };

    const handleDateConfirm = () => {
        onConfirm(date);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '350px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>ДУБЛИРОВАТЬ</h2>

                {step === 'choice' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button
                            className="download-btn"
                            onClick={() => handleChoice('sidebar')}
                            style={{ width: '100%' }}
                        >
                            В СПИСОК МЕРОПРИЯТИЙ
                        </button>
                        <button
                            className="download-btn"
                            onClick={() => handleChoice('calendar')}
                            style={{ width: '100%', background: 'white', color: 'black' }}
                        >
                            В КАЛЕНДАРЬ
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <label style={{ fontWeight: 'bold' }}>ВЫБЕРИТЕ ДАТУ:</label>
                        <input
                            type="date"
                            style={{
                                padding: '10px',
                                border: '2px solid black',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1.2rem'
                            }}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <button
                            className="download-btn"
                            onClick={handleDateConfirm}
                            style={{ marginTop: '10px' }}
                        >
                            ГОТОВО
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
