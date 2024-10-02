"use client";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import SearchBox from "./SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocation } from '@fortawesome/free-solid-svg-icons'

var zoomIn = 16;

interface PositionProps {
    position: [number, number]; // Latitude and Longitude
}

const ChangeMapView: React.FC<PositionProps> = ({ position }) => {
    const map = useMap();
    map.setView(position, zoomIn); // Update the map's position to the coordinates
    return null;
};

const VietnamMap = () => {

    const [position, setPosition] = useState<[number, number]>([
        21.0285, 105.8542,
    ]); // Default coordinates of Vietnam
    // Function to get user's current location
    const locateUser = () => {
        if (navigator.geolocation) {
            zoomIn = 30;
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPosition([latitude, longitude]); // Update position to user's location
                },
                (error) => {
                    console.error("Error getting user location:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <MapContainer
                center={position}
                zoom={10}
                style={{ height: "100vh", width: "100%", zIndex: 30 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeMapView position={position} />
            </MapContainer>
            {/* Container for the search box and locate button */}
            <div className="fixed z-50 top-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <SearchBox setPosition={setPosition} /> {/* Search box for finding locations */}
            </div>
            {/* Locate button positioned at bottom right */}
            <div className="fixed z-50 bottom-4 right-4">
                <button
                    onClick={locateUser} // Button for locating the user's position
                    className="bg-green-500 p-3 m-2 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
                >
                          <FontAwesomeIcon icon={faLocation} />
                </button>
            </div>
        </div>
    );
};

export default VietnamMap;
