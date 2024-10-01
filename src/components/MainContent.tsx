"use client";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import SearchBox from "./SearchBox";

// Định nghĩa kiểu cho props của ChangeMapView
interface PositionProps {
    position: [number, number]; // Latitude và Longitude
}

const ChangeMapView: React.FC<PositionProps> = ({ position }) => {
    const map = useMap();
    map.setView(position, 15); // Cập nhật vị trí của map theo tọa độ
    return null;
};

const VietnamMap = () => {
    const [position, setPosition] = useState<[number, number]>([
        21.0285, 105.8542,
    ]); // Tọa độ mặc định của Việt Nam

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
            <SearchBox setPosition={setPosition} />
        </div>
    );
};

export default VietnamMap;
