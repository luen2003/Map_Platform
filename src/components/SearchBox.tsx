"use client";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocation, faSearch } from '@fortawesome/free-solid-svg-icons'

interface SearchBoxProps {
    setPosition: (position: [number, number]) => void; // Prop to update map position
}

const SearchBox: React.FC<SearchBoxProps> = ({ setPosition }) => {
    const [query, setQuery] = useState(""); // State for search input

    // Handle search when the form is submitted
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = await response.json();
        if (data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]); // Update position based on search result
        } else {
            alert("Không tìm thấy địa điểm."); // Alert if no results found
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)} // Update query state on input change
                placeholder="Tìm kiếm địa điểm"
                className="border-none p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black" // Added text-black class
            />
            <button
                type="submit" // Submit button for searching
                className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
    );
};

export default SearchBox;
