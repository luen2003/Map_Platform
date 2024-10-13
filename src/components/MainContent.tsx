"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import SearchBox from "./SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocation, faDirections } from '@fortawesome/free-solid-svg-icons';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

let zoomIn = 16;

const VietnamMap = () => {
    const [position, setPosition] = useState<[number, number]>([21.0285, 105.8542]);
    const [isLocate, setIsLocate] = useState(false);
    const [start, setStart] = useState<[number, number] | null>(null);
    const [end, setEnd] = useState<[number, number] | null>(null);
    const [routingControl, setRoutingControl] = useState<any>(null);
    const [map, setMap] = useState<any>(null);
    const [markerLayer, setMarkerLayer] = useState<any>(null);
    const [endMarkerLayer, setEndMarkerLayer] = useState<any>(null);
    
    const [startText, setStartText] = useState(""); // Thêm state cho ô tìm kiếm điểm xuất phát

    const locateUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPosition([latitude, longitude]);
                    setIsLocate(true);

                    // Đặt vị trí định vị là điểm xuất phát
                    setStart([latitude, longitude]);
                    setEnd([latitude, longitude]); // Đặt vị trí định vị là điểm đến
                    setStartText(`Vị trí hiện tại: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`); // Cập nhật ô tìm kiếm

                    if (map) {
                        map.setView([latitude, longitude], zoomIn);
                    }
                },
                (error) => {
                    console.error("Error getting user location:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleStartChange = (newStart: [number, number], text: string) => {
        setStart(newStart);
        setPosition(newStart);
        setIsLocate(false);
        setStartText(text); // Cập nhật text cho ô tìm kiếm

        if (markerLayer) {
            map.removeLayer(markerLayer);
        }
        const marker = L.marker(newStart).addTo(map);
        setMarkerLayer(marker);
        map.setView(newStart, zoomIn);
    };

    const handleEndChange = (newEnd: [number, number]) => {
        setEnd(newEnd);
        
        if (endMarkerLayer) {
            map.removeLayer(endMarkerLayer);
        }
        const redMarker = L.marker(newEnd, {
            icon: L.icon({
                iconUrl: '/marker.png', // Red location marker icon
                iconSize: [30, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            }),
        }).addTo(map);
        setEndMarkerLayer(redMarker);
    };

    const handleRoute = () => {
        if (start && end) {
            if (routingControl) {
                routingControl.remove();
            }
            const control = L.Routing.control({
                waypoints: [
                    L.latLng(start[0], start[1]),
                    L.latLng(end[0], end[1]),
                ],
                routeWhileDragging: true,
            }).addTo(map);
            setRoutingControl(control);
        } else {
            alert("Please select both starting and destination points.");
        }
    };

    useEffect(() => {
        if (map) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                console.log("Map clicked at:", e.latlng);
                map.setZoom(zoomIn);
            });
        }
    }, [map]);

    return (
        <div className="h-screen flex flex-col">
            <MapContainer
                center={position}
                zoom={10}
                scrollWheelZoom={true}
                ref={setMap}
                style={{ height: "100vh", width: "100%", zIndex: 30 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {isLocate && position && (
                    <Marker position={position}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}
            </MapContainer>

            <div className="fixed z-50 top-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <SearchBox setPosition={(newStart, text) => handleStartChange(newStart, text)} type="start" value={startText} />
                <SearchBox setPosition={handleEndChange} type="end" />
            </div>

            <div className="fixed z-50 bottom-4 right-4">
                <button
                    onClick={locateUser}
                    className="bg-green-500 p-3 m-2 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
                >
                    <FontAwesomeIcon icon={faLocation} />
                </button>
                <button
                    onClick={handleRoute}
                    className="bg-blue-500 p-3 m-2 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    <FontAwesomeIcon icon={faDirections} />
                </button>
            </div>
        </div>
    );
};

export default VietnamMap;
