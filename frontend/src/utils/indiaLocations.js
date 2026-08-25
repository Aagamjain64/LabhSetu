import { City, State } from 'country-state-city';

const INDIA_COUNTRY_CODE = 'IN';

export function getIndianStates() {
  return State.getStatesOfCountry(INDIA_COUNTRY_CODE).map((state) => state.name);
}

export function getCitiesForState(stateName) {
  const match = State.getStatesOfCountry(INDIA_COUNTRY_CODE).find(
    (state) => state.name === stateName
  );
  if (!match) return [];
  const seen = new Set();
  return City.getCitiesOfState(INDIA_COUNTRY_CODE, match.isoCode)
    .map((city) => city.name)
    .filter((cityName) => {
      if (seen.has(cityName)) return false;
      seen.add(cityName);
      return true;
    });
}
