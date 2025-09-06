/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, Modality} from '@google/genai';

// FIX: Add a declaration for the 'google' object from the Google Maps API script.
declare const google: any;

const GOOGLE_MAPS_API_KEY = "REPLACE ME PLEASE";

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

// UI Elements
const mainTitle = document.getElementById('main-title') as HTMLHeadingElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const mapContainer = document.getElementById('map-container');
const editedImageContainer = document.getElementById('edited-image-container');
const locationSearchInput = document.getElementById('location-search-input') as HTMLInputElement;
const yourMapCaption = document.getElementById('your-map-caption') as HTMLHeadingElement;
const treasureMapCaption = document.getElementById('treasure-map-caption') as HTMLHeadingElement;

// --- THEME DATA ---
// A central object to hold all theme-specific data.
const themeData: Record<string, {
    prompt: string;
    captions: { yourMap: string; treasureMap: string; };
    mapStyle: any[];
    title: string;
    buttonText: string;
    placeholder: string;
}> = {
    pirate: {
        prompt: "transform this into a weathered, old-timey pirate treasure map. Add a compass rose, rhumb lines, and a sea monster if there is water.",
        captions: { yourMap: "Captain's Chart", treasureMap: "X Marks the Spot" },
        title: "Scallywag's Map Maker",
        buttonText: "Unfurl the Map",
        placeholder: "e.g., 'Tortuga' or 'The Spanish Main'",
        mapStyle: [
            { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
            { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b2a6" }] },
            { featureType: "administrative.land_parcel", elementType: "geometry.stroke", stylers: [{ color: "#dcd2be" }] },
            { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#ae9e90" }] },
            { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#93817c" }] },
            { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#a5b076" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#447530" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f1e6" }] },
            { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfcf8" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c967" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e9bc62" }] },
            { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#e98d58" }] },
            { featureType: "road.highway.controlled_access", elementType: "geometry.stroke", stylers: [{ color: "#db8555" }] },
            { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#806b63" }] },
            { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
            { featureType: "transit.line", elementType: "labels.text.fill", stylers: [{ color: "#8f7d77" }] },
            { featureType: "transit.line", elementType: "labels.text.stroke", stylers: [{ color: "#ebe3cd" }] },
            { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
            { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b9d3c2" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#92998d" }] },
        ],
    },
    wizard: {
        prompt: "transform this into an enchanted fantasy map from a world of magic. Add mystical forests, glowing runes on mountains, and a dragon's lair.",
        captions: { yourMap: "Arcane Atlas", treasureMap: "Enchanted Realm" },
        title: "Alchemist's Atlas",
        buttonText: "Cast the Spell",
        placeholder: "e.g., 'The Forbidden Forest' or 'Mount Doom'",
        mapStyle: [
            { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
            { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
            { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
            { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
            { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
            { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
            { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
            { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
            { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
            { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
            { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
            { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
            { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
        ],
    },
    cyberpunk: {
        prompt: "transform this into a neon-drenched, high-tech cyberpunk city grid. Add holographic advertisements, glowing data streams along the streets, and massive futuristic skyscrapers.",
        captions: { yourMap: "City Grid-Scan", treasureMap: "Neon Simulacrum" },
        title: "Netrunner's Grid",
        buttonText: "Hack the Planet",
        placeholder: "e.g., 'Neo-Tokyo' or 'Night City'",
        mapStyle: [
            { stylers: [{ hue: "#00ffea" }, { saturation: -50 }, { lightness: -60 }, { gamma: 1.5 }] },
            { featureType: "road", elementType: "geometry", stylers: [{ "color": "#FF00FF" }, { "lightness": -20 }] },
            { featureType: "road.highway", stylers: [{ color: "#00ffff" }, { lightness: -10 }] },
            { featureType: "transit.line", stylers: [{ "color": "#ffff00" }] },
            { featureType: "water", stylers: [{ color: "#0000ff" }, { lightness: -20 }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ "color": "#00ffff" }] },
            { featureType: "landscape", stylers: [{ color: "#220033" }] },
            { elementType: "labels.text.fill", stylers: [{ "color": "#ffffff" }] },
            { elementType: "labels.text.stroke", stylers: [{ "visibility": "off" }] }
        ],
    },
    astronaut: {
        prompt: "transform this into a futuristic, alien planetary survey map or star chart. Add craters, strange geological formations, markings for potential landing zones, and a small spaceship icon.",
        captions: { yourMap: "Stellar Cartography", treasureMap: "New Worlds" },
        title: "Stardrive Cartography",
        buttonText: "Engage Thrusters",
        placeholder: "e.g., 'Cape Canaveral' or 'Area 51'",
        mapStyle: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
        ],
    },
    princess: {
        prompt: "transform this into a whimsical fairytale kingdom map. Add a sparkling castle, an enchanted forest, a winding path of cobblestones, and cute, friendly creatures.",
        captions: { yourMap: "Royal Decree Map", treasureMap: "The Kingdom" },
        title: "Her Majesty's Cartography",
        buttonText: "Issue Royal Decree",
        placeholder: "e.g., 'Cinderella Castle' or 'The Black Forest'",
        mapStyle: [
            { elementType: "geometry", stylers: [{ color: "#fde6f0" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#615c70" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
            { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            // FIX: The original line had a duplicate 'stylers' key, which is a syntax error. It has been split into two separate, valid style rules.
            { featureType: "poi.park", stylers: [{ visibility: "on" }] },
            { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#b9e6cf" }] },
            { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#ffb6c1" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#add8e6" }] },
        ],
    }
};

let map: any; // To hold the main map instance
let selectedTheme = 'pirate'; // Default theme

// Function to initialize the Google Map and Places Autocomplete
function initMap() {
    if (!mapContainer || !locationSearchInput) return;
    mapContainer.innerHTML = ''; // Clear "Loading..." text
    
    // Create a new map instance.
    map = new google.maps.Map(mapContainer, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 13,
        styles: themeData[selectedTheme].mapStyle // Apply default theme style on init
    });

    // --- Initialize Places Autocomplete ---
    const autocomplete = new google.maps.places.Autocomplete(locationSearchInput, {
        fields: ["geometry", "name"], // Request only necessary fields
    });
    autocomplete.bindTo('bounds', map); // Bias results to the current map viewport

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            console.warn("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, present it on the map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
    });
    
    updateButtonState(true); // Enable button once map is loaded
}

// Attach initMap to the window object so the Maps API can call it.
(window as any).initMap = initMap;

// Helper function to fetch a static map image and convert it to a base64 string.
async function getStaticMapAsBase64(options: {
    center: { lat: number; lng: number; };
    zoom: number;
    width: number;
    height: number;
    maptype: 'terrain' | 'roadmap' | 'satellite' | 'hybrid';
    styles?: string[];
}): Promise<string> {
    const { center, zoom, width, height, maptype, styles = [] } = options;

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
        center: `${center.lat},${center.lng}`,
        zoom: (zoom).toString(),
        size: `${width}x${height}`,
        maptype: maptype,
        key: GOOGLE_MAPS_API_KEY,
    });

    // The Static Maps API requires each style rule to be a separate parameter
    for (const style of styles) {
        params.append('style', style);
    }

    const imageUrl = `${baseUrl}?${params.toString()}`;

    // Fetch the image from the Static Map API
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch static map: ${response.statusText}`);
    }

    // Convert the image response (blob) to a base64 string
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // The result includes a data URL prefix that needs to be removed
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


// Function to handle the image editing generation
async function generateImage() {
    if (!map || !editedImageContainer || !mapContainer) {
        alert('Please ensure the map has loaded.');
        return;
    }

    setLoading(true);

    try {
        const center = map.getCenter().toJSON();
        const zoom = map.getZoom();
        const width = mapContainer.clientWidth;
        const height = mapContainer.clientHeight;
        const stylesWithoutLabels = ['feature:all|element:labels|visibility:off', 'feature:administrative|visibility:off'];

        const [
            terrainMapBase64,
            streetMapWithLabelsBase64,
            streetMapWithoutLabelsBase64
        ] = await Promise.all([
            getStaticMapAsBase64({ center, zoom, width, height, maptype: 'terrain', styles: stylesWithoutLabels }),
            getStaticMapAsBase64({ center, zoom, width, height, maptype: 'roadmap' }),
            getStaticMapAsBase64({ center, zoom, width, height, maptype: 'roadmap', styles: stylesWithoutLabels }),
        ]);

        const terrainImagePart = { inlineData: { data: terrainMapBase64, mimeType: 'image/png' } };
        const streetImageWithLabelsPart = { inlineData: { data: streetMapWithLabelsBase64, mimeType: 'image/png' } };
        const streetImageWithoutLabelsPart = { inlineData: { data: streetMapWithoutLabelsBase64, mimeType: 'image/png' } };

        const prompt = themeData[selectedTheme].prompt;
        const textPart = {
            text: `Based on the three provided maps (a terrain view, a street view with labels, and a street view without labels), ${prompt}`,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    terrainImagePart,
                    streetImageWithLabelsPart,
                    streetImageWithoutLabelsPart,
                    textPart,
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        editedImageContainer.innerHTML = '';

        let imageFound = false;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const src = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                const img = new Image();
                img.src = src;
                img.alt = `Generated ${selectedTheme} map`;
                editedImageContainer.appendChild(img);
                imageFound = true;
                break;
            }
        }
        if (!imageFound) {
            editedImageContainer.innerHTML = `<p>No image was generated. The model might have returned text instead. Check the console for details.</p>`;
        }

    } catch (error) {
        console.error("Error generating image:", error);
        if (editedImageContainer) {
            editedImageContainer.innerHTML = `<p style="color: red;">Error: Could not generate image. Check the console for details.</p>`;
        }
    } finally {
        setLoading(false);
    }
}

// Manages the loading state of the UI
function setLoading(isLoading: boolean) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        editedImageContainer.innerHTML = '<div class="loader" role="status" aria-label="Loading treasure map"></div>';
    }
}

// Enables or disables the generate button
function updateButtonState(enabled: boolean) {
    generateBtn.disabled = !enabled;
}

// Applies the selected theme to the entire application
function applyTheme(theme: string) {
    if (!themeData[theme]) return;

    // 1. Update body class for CSS styling
    document.body.className = `theme-${theme}`;

    // 2. Update text content for titles, button, and placeholder
    if (mainTitle && yourMapCaption && treasureMapCaption && generateBtn && locationSearchInput) {
        mainTitle.textContent = themeData[theme].title;
        yourMapCaption.textContent = themeData[theme].captions.yourMap;
        treasureMapCaption.textContent = themeData[theme].captions.treasureMap;
        generateBtn.textContent = themeData[theme].buttonText;
        locationSearchInput.placeholder = themeData[theme].placeholder;
    }

    // 3. Update Google Map style
    if (map) {
        map.setOptions({ styles: themeData[theme].mapStyle });
    }
}

// Sets up the theme selector buttons
function setupThemeSelector() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = (button as HTMLElement).dataset.theme;
            if (theme && theme !== selectedTheme) {
                selectedTheme = theme;
                // Update active class
                themeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                // Apply all theme changes
                applyTheme(theme);
            }
        });
    });
    // Apply the default theme on initial load
    applyTheme(selectedTheme);
}

// Loads the Google Maps script dynamically.
function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Initial setup on page load
function main() {
    if (!generateBtn) {
        console.error('Required UI elements not found');
        return;
    }
    generateBtn.addEventListener('click', generateImage);
    setupThemeSelector();
    updateButtonState(false); // Disable button until map is loaded
    loadGoogleMapsScript();
}

main();