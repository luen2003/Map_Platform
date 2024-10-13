// Knob.tsx
import React from 'react';

interface KnobProps {
    onRotate: (angle: number) => void;
}

const Knob: React.FC<KnobProps> = ({ onRotate }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const angle = parseFloat(event.target.value);
        onRotate(angle);
    };

    return (
        <div className="flex flex-col items-center">
            <input
                type="range"
                min="-180"
                max="180"
                step="1"
                onChange={handleChange}
                className="knob"
            />
            <span>Rotate Map</span>
        </div>
    );
};

export default Knob;
