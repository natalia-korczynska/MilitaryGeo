import React from "react";
import "./StylePanel.css";

export default function StylePanel({ styles, onStyleChange }) {
  return (
    <div className="style-panel">
      <h3>Styl warstwy</h3>
      
      {/* Kolor */}
      <label>
        Kolor: 
        <input 
          type="color" 
          value={styles.color} 
          onChange={(e) => onStyleChange("color", e.target.value)} 
        />
      </label>

      {/* Grubość */}
      <label>
        Grubość: {styles.weight}
        <input 
          type="range" 
          min="1" max="10" 
          value={styles.weight} 
          onChange={(e) => onStyleChange("weight", parseInt(e.target.value))} 
        />
      </label>

      {/* Przezroczystość */}
      <label>
        Przezroczystość: {styles.opacity}
        <input 
          type="range" 
          min="0" max="1" step="0.1"
          value={styles.opacity} 
          onChange={(e) => onStyleChange("opacity", parseFloat(e.target.value))} 
        />
      </label>
    </div>
  );
}