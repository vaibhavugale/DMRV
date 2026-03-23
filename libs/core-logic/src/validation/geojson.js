"use strict";
// GeoJSON validation utilities for farm polygons and tree coordinates
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPoint = isValidPoint;
exports.isValidPolygon = isValidPolygon;
exports.pointInPolygon = pointInPolygon;
exports.calculatePolygonArea = calculatePolygonArea;
exports.squareDegreesToHectares = squareDegreesToHectares;
exports.calculateCentroid = calculateCentroid;
/**
 * Validate GeoJSON Point coordinates
 * Longitude: -180 to 180, Latitude: -90 to 90
 */
function isValidPoint(point) {
    if (point.type !== 'Point')
        return false;
    if (!Array.isArray(point.coordinates) || point.coordinates.length !== 2)
        return false;
    const [lng, lat] = point.coordinates;
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
/**
 * Validate GeoJSON Polygon
 * - Must have at least one ring
 * - Each ring must have at least 4 positions (first = last)
 * - First and last positions must be identical (closed ring)
 */
function isValidPolygon(polygon) {
    if (polygon.type !== 'Polygon')
        return false;
    if (!Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0)
        return false;
    for (const ring of polygon.coordinates) {
        if (ring.length < 4)
            return false;
        // First and last must be identical
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1])
            return false;
        // Validate each coordinate
        for (const coord of ring) {
            if (coord.length < 2)
                return false;
            if (coord[0] < -180 || coord[0] > 180 || coord[1] < -90 || coord[1] > 90)
                return false;
        }
    }
    return true;
}
/**
 * Simple point-in-polygon check using ray casting algorithm
 */
function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
}
/**
 * Calculate polygon area using Shoelace formula (in square degrees)
 * For actual area in hectares, multiply by the cos(latitude) factor
 */
function calculatePolygonArea(coordinates) {
    let area = 0;
    const n = coordinates.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }
    return Math.abs(area / 2);
}
/**
 * Convert square degrees to approximate hectares
 * This is a simplified conversion; for production, use Turf.js
 */
function squareDegreesToHectares(sqDegrees, latitudeDeg) {
    const latRad = (latitudeDeg * Math.PI) / 180;
    const metersPerDegLat = 111_132;
    const metersPerDegLng = 111_320 * Math.cos(latRad);
    const sqMeters = sqDegrees * metersPerDegLat * metersPerDegLng;
    return sqMeters / 10_000;
}
/**
 * Calculate the centroid of a polygon
 */
function calculateCentroid(coordinates) {
    let sumLng = 0;
    let sumLat = 0;
    const n = coordinates.length - 1; // Exclude repeated last point
    for (let i = 0; i < n; i++) {
        sumLng += coordinates[i][0];
        sumLat += coordinates[i][1];
    }
    return [sumLng / n, sumLat / n];
}
//# sourceMappingURL=geojson.js.map