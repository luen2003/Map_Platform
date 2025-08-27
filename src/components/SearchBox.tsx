import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck } from '@fortawesome/free-solid-svg-icons';

interface SearchBoxProps {
    setPosition: (position: [number, number], text: string) => void;
    type: 'start' | 'end';
    value?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ setPosition, type, value }) => {
    const [query, setQuery] = useState(value || "");

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = await response.json();
        if (data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)], query);
        } else {
            alert("Không tìm thấy địa điểm.");
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={type === 'start' ? "Điểm xuất phát" : "Điểm đến"} 
                className="border-none p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black w-32" // Thay đổi kích thước ở đây
            />
            <button
                type="submit"
                className="ml-2 bg-blue-500 text-white p-1 rounded-lg hover:bg-blue-600 transition duration-300" // Thay đổi kích thước nút ở đây
            >
                {type === 'start' ? <FontAwesomeIcon icon={faSearch}/> : <FontAwesomeIcon icon={faCheck}/>}
            </button>
        </form>
    );
};

export default SearchBox;
