// Live 7-day forecast for any place name, via Open-Meteo (free, no key, worldwide).

export interface WeatherData {
  day: string;
  date: string;
  tempHigh: number;   // °C
  tempLow: number;    // °C
  humidity: number;   // %
  precipitation: number; // % chance
  windSpeed: number;  // km/h
  condition: string;
  icon: string;       // FontAwesome icon name
}

// WMO weather codes -> label + FontAwesome icon
function describeWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear', icon: 'fa-sun' };
  if (code <= 2) return { condition: 'Partly Cloudy', icon: 'fa-cloud-sun' };
  if (code === 3) return { condition: 'Overcast', icon: 'fa-cloud' };
  if (code <= 48) return { condition: 'Fog', icon: 'fa-smog' };
  if (code <= 57) return { condition: 'Drizzle', icon: 'fa-cloud-rain' };
  if (code <= 67) return { condition: 'Rain', icon: 'fa-cloud-rain' };
  if (code <= 77) return { condition: 'Snow', icon: 'fa-snowflake' };
  if (code <= 82) return { condition: 'Rain Showers', icon: 'fa-cloud-showers-heavy' };
  if (code <= 86) return { condition: 'Snow Showers', icon: 'fa-snowflake' };
  return { condition: 'Thunderstorm', icon: 'fa-cloud-bolt' };
}

/** Turn a place name ("Truro, Nova Scotia") or "lat, lon" into coordinates. */
export async function geocode(location: string): Promise<{ lat: number; lon: number; name: string }> {
  const coordMatch = location.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordMatch) {
    return { lat: parseFloat(coordMatch[1]), lon: parseFloat(coordMatch[2]), name: location };
  }

  // Open-Meteo geocoding matches a single place name, so try the full string, then the first part
  const candidates = [location, location.split(',')[0]].map(s => s.trim()).filter(Boolean);
  for (const name of candidates) {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json`);
    const data = await res.json();
    if (data.results?.length) {
      // Prefer a result whose region/country appears in the user's text
      const lower = location.toLowerCase();
      const best = data.results.find((r: any) =>
        (r.admin1 && lower.includes(r.admin1.toLowerCase())) || (r.country && lower.includes(r.country.toLowerCase()))
      ) || data.results[0];
      return { lat: best.latitude, lon: best.longitude, name: [best.name, best.admin1, best.country].filter(Boolean).join(', ') };
    }
  }
  throw new Error(`Could not find location "${location}"`);
}

export async function getRealWeatherForecast(location: string): Promise<WeatherData[]> {
  try {
    const { lat, lon } = await geocode(location);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean` +
      `&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
    const d = (await res.json()).daily;

    return d.time.map((iso: string, i: number) => {
      const date = new Date(`${iso}T12:00:00`);
      const { condition, icon } = describeWeatherCode(d.weathercode[i]);
      return {
        day: date.toLocaleDateString('en-CA', { weekday: 'short' }),
        date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        tempHigh: Math.round(d.temperature_2m_max[i]),
        tempLow: Math.round(d.temperature_2m_min[i]),
        humidity: Math.round(d.relative_humidity_2m_mean?.[i] ?? 60),
        precipitation: Math.round(d.precipitation_probability_max?.[i] ?? 0),
        windSpeed: Math.round(d.wind_speed_10m_max[i]),
        condition,
        icon,
      };
    });
  } catch (error) {
    console.error('Error fetching weather forecast, using sample data:', error);
    return generateFallbackData();
  }
}

// Sample data if the API is unreachable
function generateFallbackData(): WeatherData[] {
  const conditions = [
    { name: 'Clear', icon: 'fa-sun', temp: [8, 18] },
    { name: 'Partly Cloudy', icon: 'fa-cloud-sun', temp: [6, 15] },
    { name: 'Overcast', icon: 'fa-cloud', temp: [5, 12] },
    { name: 'Rain', icon: 'fa-cloud-rain', temp: [4, 10] },
  ];

  return Array.from({ length: 7 }, (_, index) => {
    const c = conditions[index % conditions.length];
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      day: date.toLocaleDateString('en-CA', { weekday: 'short' }),
      date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      tempHigh: c.temp[1],
      tempLow: c.temp[0],
      humidity: 70,
      precipitation: c.name === 'Rain' ? 70 : 20,
      windSpeed: 15,
      condition: `${c.name} (sample)`,
      icon: c.icon,
    };
  });
}
