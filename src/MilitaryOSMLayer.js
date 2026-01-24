import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import axios from "axios";
import osmtogeojson from "osmtogeojson";

// Importujemy style i nowe komponenty
import "./MilitaryOSMLayer.css";
import Legend from "./Legend";
import StylePanel from "./StylePanel";

const MILITARY_TYPES = [
    "barracks",
    "naval_base",
    "airfield", 
    "training_area"
];

const MILITARY_LABELS = {
    barracks: "Koszary",
    naval_base: "Baza morska",
    airfield: "Lotnisko",
    training_area: "Poligon",
    all: "Wszystkie warstwy"
};

export default function MilitaryOSMLayer() {
    const [militaryType, setMilitaryType] = useState("barracks");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Stan dla stylów (kolor, grubość, przezroczystość)
    const [layerStyle, setLayerStyle] = useState({
        color: "#ff0000",
        weight: 6,
        opacity: 0.5
    });

    const layerRef = useRef(null);
    const map = useMap();

    // Funkcja aktualizująca styl
    const handleStyleChange = (key, value) => {
        setLayerStyle(prev => ({ ...prev, [key]: value }));
    };

    const fetchData = async (type) => {
        setLoading(true);
        setData(null);

        let queryInner = "";
        
        if (type === "all") {
             const typesQuery = MILITARY_TYPES.map(t => 
                `way["military"="${t}"](area.a); relation["military"="${t}"](area.a);`
             ).join("\n");
             queryInner = typesQuery;
        } else {
             queryInner = `
                way["military"="${type}"](area.a);
                relation["military"="${type}"](area.a);
             `;
        }

        const query = `
          [out:json][timeout:60];
          area["ISO3166-1"="PL"]->.a;
          (
            ${queryInner}
          );
          out geom;
        `;

        const requestUrl = "https://overpass.kumi.systems/api/interpreter?data=" + encodeURIComponent(query);

        try {
            const res = await axios.get(requestUrl);
            const geojson = osmtogeojson(res.data);
            setData(geojson);
        } catch (e) {
            console.error("Błąd Overpass:", e);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(militaryType);
    }, [militaryType]);

    useEffect(() => {
        if (!data || !layerRef.current) return;
        const bounds = layerRef.current.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { animate: true });
        }
    }, [data, map]);

    const objectCount = data && data.features ? data.features.length : 0;
    const currentLabel = MILITARY_LABELS[militaryType] || militaryType;

    return (
        <>
            {/* LOADER */}
            {loading && (
                <div className="loader-overlay">
                    Ładowanie: {currentLabel}
                </div>
            )}

            {/* GÓRNY PANEL */}
            <div className="top-panel">
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                    Typ obiektu wojskowego:
                </div>
                {MILITARY_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setMilitaryType(type)}
                        className={`filter-btn ${type === militaryType ? "active" : "inactive"}`}
                    >
                        {MILITARY_LABELS[type] || type}
                    </button>
                ))}
                
                <button 
                    onClick={() => setMilitaryType("all")}
                    className={`filter-btn ${militaryType === "all" ? "active" : "inactive"}`}
                >
                    Pokaż wszystkie
                </button>
            </div>

            {/* LEGENDA */}
            <Legend activeType={currentLabel} objectCount={objectCount} />

            {/* PANEL STYLU */}
            <StylePanel styles={layerStyle} onStyleChange={handleStyleChange} />

            {/* WARSTWA MAPY */}
            {data && (
                <GeoJSON
                    key={militaryType}
                    data={data}
                    ref={layerRef}
                    style={() => ({
                        color: layerStyle.color,
                        weight: layerStyle.weight,
                        opacity: 1,
                        fillColor: layerStyle.color,
                        fillOpacity: layerStyle.opacity
                    })}
                />
            )}
        </>
    );
}