import 'leaflet';

declare module 'leaflet' {
    namespace Routing {
        interface Control extends L.Control {
            setWaypoints(waypoints: LatLngExpression[]): this;
        }

        interface RoutingControlOptions {
            createMarker?: (waypoint: L.LatLng, key: number) => L.Marker | null;
            geocoder?: L.Control.Geocoder; // Optionally add geocoder support
        }

    }

    namespace Control {
        namespace Geocoder {
            function nominatim(): any; // Replace 'any' with a more specific type if possible
        }
    }
}
