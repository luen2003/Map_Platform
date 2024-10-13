import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck } from '@fortawesome/free-solid-svg-icons';

interface SearchBoxProps {
    setPosition: (position: [number, number], text: string) => void; // Cập nhật kiểu nhận hai tham số
    type: 'start' | 'end'; // Phân biệt giữa điểm xuất phát và điểm đến
    value?: string; // Hiển thị vị trí hiện tại trong ô nhập liệu
}

const SearchBox: React.FC<SearchBoxProps> = ({ setPosition, type, value }) => {
    const [query, setQuery] = useState(value || "");

    // Cập nhật query khi prop value thay đổi
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
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)], query); // Cập nhật cả vị trí và văn bản
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
                placeholder={type === 'start' ? "Điểm xuất phát và Tìm kiếm" : "Điểm đến"} 
                className="border-none p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black" 
            />
            <button
                type="submit"
                className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                {type === 'start' ? <FontAwesomeIcon icon={faSearch}/> : <FontAwesomeIcon icon={faCheck}/>}
            </button>
        </form>
    );
};

export default SearchBox;
