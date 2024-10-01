"use client";
import { useState } from "react";

interface SearchBoxProps {
    setPosition: (position: [number, number]) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ setPosition }) => {
    const [query, setQuery] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
        );
        const data = await response.json();
        if (data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="fixed w-full bg-black z-50 p-4 flex items-center focus-within:border-blue-500 text-black"
        >
            <span className="material-icons mr-2 text-gray-500">
                <h1 className="text-center p-2 font-bold">Bản đồ Việt Nam</h1>
            </span>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm địa điểm"
                className="border-none p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
                type="submit"
                className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                Tìm kiếm
            </button>
        </form>
    );
};

export default SearchBox;
