"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import SearchBox from "./SearchBox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocation, faDirections } from '@fortawesome/free-solid-svg-icons';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const zoomIn = 16;

const VietnamMap = () => {
    const [queryMarkers, setQueryMarkers] = useState<L.Marker[]>([]);

    const [position, setPosition] = useState<[number, number]>([21.0285, 105.8542]);
    const [isLocate, setIsLocate] = useState(false);
    const [start, setStart] = useState<[number, number] | null>(null);
    const [end, setEnd] = useState<[number, number] | null>(null);
    const [routingControl, setRoutingControl] = useState<any>(null);
    const [map, setMap] = useState<any>(null);
    const [markerLayer, setMarkerLayer] = useState<any>(null);
    const [endMarkerLayer, setEndMarkerLayer] = useState<any>(null);
    const [startText, setStartText] = useState("");

    const clearQueryMarkers = () => {
        queryMarkers.forEach(marker => map.removeLayer(marker));
        setQueryMarkers([]);
    };

    const watchId = useRef<number | null>(null);

    // Hàm để đặt marker và set vị trí map, dùng cho locateUser và tự động từ query
    const setLocation = (lat: number, lon: number, text: string, zoom = zoomIn) => {
        const newPos: [number, number] = [lat, lon];

        setPosition(newPos);
        setIsLocate(true);
        setStart(newPos);
        setEnd((prevEnd) => prevEnd || newPos);
        setStartText(text);

        if (map) {
            map.setView(newPos, zoom);
        }

        if (markerLayer) {
            markerLayer.setLatLng(newPos);
        } else if (map) {
            const marker = L.marker(newPos).addTo(map);
            setMarkerLayer(marker);
        }

        // Nếu đang có tuyến đường, cập nhật lại
        if (start && end && routingControl) {
            routingControl.setWaypoints([
                L.latLng(newPos[0], newPos[1]),
                L.latLng(end[0], end[1]),
            ]);
        }
    };

    const locateUser = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                setLocation(
                    latitude,
                    longitude,
                    `Vị trí hiện tại: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`
                );
            },
            (error) => {
                console.error("Error getting user location:", error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
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

        const marker = L.marker(newEnd).addTo(map);
        setEndMarkerLayer(marker);
        map.setView(newEnd, zoomIn);
    };

    const handleRoute = () => {
        if (!start || !end) {
            alert("Please select both starting and destination points.");
            return;
        }

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
    };

    useEffect(() => {
        if (!map) return;

        const params = new URLSearchParams(window.location.search);
        const lat = params.get("lat");
        const lon = params.get("lon");
        const query = params.get("q");

        // ƯU TIÊN lat/lon
        if (lat && lon) {
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);

            if (!isNaN(latNum) && !isNaN(lonNum)) {
                setLocation(
                    latNum,
                    lonNum,
                    `Vị trí từ URL: [${latNum.toFixed(4)}, ${lonNum.toFixed(4)}]`
                );
                return;
            }
        }

        // XỬ LÝ q = nhiều địa điểm
        if (query) {
            const cities = query.split(",").map(c => c.trim());

            clearQueryMarkers();

            const fetchCities = async () => {
                const newMarkers: L.Marker[] = [];

                for (const city of cities) {
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
                        );
                        const data = await res.json();

                        if (data && data.length > 0) {
                            const { lat, lon, display_name } = data[0];

                            const marker = L.marker([parseFloat(lat), parseFloat(lon)])
                                .addTo(map)
                                .bindPopup(display_name);

                            newMarkers.push(marker);
                        }
                    } catch (err) {
                        console.error("Lỗi tìm:", city, err);
                    }
                }

                setQueryMarkers(newMarkers);

                // Zoom để thấy tất cả marker
                if (newMarkers.length > 0) {
                    const group = L.featureGroup(newMarkers);
                    map.fitBounds(group.getBounds(), { padding: [50, 50] });
                }
            };

            fetchCities();
        }
    }, [map]);

    useEffect(() => {
        if (!map) return;

        const search = window.location.search;
        if (!search.includes("lat=")) return;

        // lat=21.03&lon=105.75,lat=21.05&lon=105.80
        const pairs = search
            .replace("?", "")
            .split(",");

        const coords: [number, number][] = [];

        pairs.forEach(pair => {
            const latMatch = pair.match(/lat=([0-9.\-]+)/);
            const lonMatch = pair.match(/lon=([0-9.\-]+)/);

            if (latMatch && lonMatch) {
                const lat = parseFloat(latMatch[1]);
                const lon = parseFloat(lonMatch[1]);

                if (!isNaN(lat) && !isNaN(lon)) {
                    coords.push([lat, lon]);
                }
            }
        });

        if (coords.length === 0) return;

        // Clear marker cũ
        queryMarkers.forEach(m => map.removeLayer(m));

        const newMarkers: L.Marker[] = [];

        coords.forEach((c, idx) => {
            const marker = L.marker(c)
                .addTo(map)
                .bindPopup(`Point ${idx + 1}<br/>${c[0]}, ${c[1]}`);
            newMarkers.push(marker);
        });

        setQueryMarkers(newMarkers);

        // Zoom để thấy tất cả
        const group = L.featureGroup(newMarkers);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });

    }, [map]);


    useEffect(() => {
        if (map) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                console.log("Map clicked at:", e.latlng);
                map.setZoom(zoomIn);
            });
        }

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
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
                        <Popup>Bạn đang ở đây</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* SỬA CLASS Ở ĐÂY ĐỂ TRÁNH ĐÈ LÊN NÚT ZOOM TRÊN MOBILE */}
            <div className="fixed z-50 top-4 left-12 md:left-1/2 md:transform md:-translate-x-1/2 flex space-x-2 md:space-x-4">                <SearchBox setPosition={(newStart, text) => handleStartChange(newStart, text)} type="start" value={startText} />
                <SearchBox setPosition={(newEnd, _) => handleEndChange(newEnd)} type="end" />
            </div>

            <div className="fixed z-50 bottom-4 right-4 flex flex-col items-end">
                <button
                    onClick={locateUser}
                    className="bg-green-500 p-3 m-2 text-white rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
                    title="Định vị vị trí hiện tại"
                >
                    <FontAwesomeIcon icon={faLocation} />
                </button>
                <button
                    onClick={handleRoute}
                    className="bg-blue-500 p-3 m-2 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
                    title="Tạo tuyến đường"
                >
                    <FontAwesomeIcon icon={faDirections} />
                </button>
            </div>
        </div>
    );
};

export default VietnamMap;