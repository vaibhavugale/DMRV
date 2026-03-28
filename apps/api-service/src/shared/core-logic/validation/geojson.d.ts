import { IGeoJSONPoint, IGeoJSONPolygon } from '../interfaces/farm-plot';
/**
 * Validate GeoJSON Point coordinates
 * Longitude: -180 to 180, Latitude: -90 to 90
 */
export declare function isValidPoint(point: IGeoJSONPoint): boolean;
/**
 * Validate GeoJSON Polygon
 * - Must have at least one ring
 * - Each ring must have at least 4 positions (first = last)
 * - First and last positions must be identical (closed ring)
 */
export declare function isValidPolygon(polygon: IGeoJSONPolygon): boolean;
/**
 * Simple point-in-polygon check using ray casting algorithm
 */
export declare function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean;
/**
 * Calculate polygon area using Shoelace formula (in square degrees)
 * For actual area in hectares, multiply by the cos(latitude) factor
 */
export declare function calculatePolygonArea(coordinates: [number, number][]): number;
/**
 * Convert square degrees to approximate hectares
 * This is a simplified conversion; for production, use Turf.js
 */
export declare function squareDegreesToHectares(sqDegrees: number, latitudeDeg: number): number;
/**
 * Calculate the centroid of a polygon
 */
export declare function calculateCentroid(coordinates: [number, number][]): [number, number];
//# sourceMappingURL=geojson.d.ts.map