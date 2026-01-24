import React from "react";
import "./Legend.css";

export default function Legend({ activeType, objectCount }) {
  return (
    <div className="legend-container">
      <h3>Legenda</h3>
      <div>
        <strong>Typ:</strong> {activeType}
      </div>
      <div>
        <strong>Liczba obiektów:</strong> {objectCount}
      </div>
    </div>
  );
}