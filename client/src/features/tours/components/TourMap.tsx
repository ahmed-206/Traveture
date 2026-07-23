import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { type Tour } from "../types";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface TourMapProps {
  tour: Tour;
}
export const TourMap = ({ tour }: TourMapProps) => {
    const startCoordinates = tour.startLocation?.coordinates;
    const center: [number, number] =
    startCoordinates && startCoordinates.length === 2
      ? [startCoordinates[1], startCoordinates[0]]
      : [30.0444, 31.2357];

    return (
        <div className="w-full h-112.5 relative z-0">
          <MapContainer
            center={center}
            zoom={7}
            scrollWheelZoom={false} 
            className="w-full h-full"
          >
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
    
            
            {startCoordinates && (
              <Marker position={[startCoordinates[1], startCoordinates[0]]}>
                <Popup>
                  <div className="text-center font-sans">
                    <span className="font-bold text-primary block">Start Location</span>
                    <span>{tour.startLocation?.description}</span>
                  </div>
                </Popup>
              </Marker>
            )}
    
           
            {tour.locations?.map((loc) => {
         
          if (!loc.coordinates || loc.coordinates.length < 2) return null;

          return (
            <Marker
              key={loc._id}
              position={[loc.coordinates[1], loc.coordinates[0]]}
            >
              <Popup>
                <div className="text-center font-sans">
                  <span className="font-bold block">Day {loc.day}</span>
                  <span>{loc.description}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
          </MapContainer>
        </div>
      );
};
