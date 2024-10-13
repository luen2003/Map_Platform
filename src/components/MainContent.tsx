"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import SearchBox from "./SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocation, faDirections } from '@fortawesome/free-solid-svg-icons';
import Knob from "./Knob"; // Import Knob component
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
    
    const [startText, setStartText] = useState("");
    const [rotation, setRotation] = useState(0); // Thêm state cho góc xoay

    const locateUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPosition([latitude, longitude]);
                    setIsLocate(true);
                    setStart([latitude, longitude]);
                    setEnd([latitude, longitude]);
                    setStartText(`Vị trí hiện tại: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`);
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
        setStartText(text);
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
                iconUrl: '/marker.png',
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

    const handleRotate = (angle: number) => {
        setRotation(angle);
        if (map) {
            map.getContainer().style.transform = `rotate(${angle}deg)`;
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
    // Touch event handling for rotation
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            const startX = e.touches[0].clientX;
            const startY = e.touches[0].clientY;

            const handleTouchMove = (e: TouchEvent) => {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

                handleRotate(angle);
            };

            const handleTouchEnd = () => {
                if (map) {
                map.removeEventListener("touchmove", handleTouchMove);
                map.removeEventListener("touchend", handleTouchEnd);
                }
            };
            if (map) {
                map.addEventListener("touchmove", handleTouchMove);
                map.addEventListener("touchend", handleTouchEnd);
            }
        };

        map?.addEventListener("touchstart", handleTouchStart);

        return () => {
            map?.removeEventListener("touchstart", handleTouchStart);
        };
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

            <div className="fixed z-50 bottom-4 right-4 flex flex-col items-end">
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
                <Knob onRotate={handleRotate} />
            </div>
        </div>
    );
};

export default VietnamMap;
