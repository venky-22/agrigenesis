// Open-Meteo is a free weather API that requires no API key.
// Docs: https://open-meteo.com/

export const getClimateData = async (lat, lon) => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        const data = await response.json();

        return {
            currentTemp: data.current.temperature_2m,
            precipitation: data.current.precipitation,
            windSpeed: data.current.wind_speed_10m,
            dailyMax: data.daily.temperature_2m_max[0],
            dailyMin: data.daily.temperature_2m_min[0],
            units: data.current_units
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
};
