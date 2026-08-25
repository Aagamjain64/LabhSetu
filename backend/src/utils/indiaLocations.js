const { City, State } = require('country-state-city');

const INDIA_COUNTRY_CODE = 'IN';

function getStateRecords() {
  return State.getStatesOfCountry(INDIA_COUNTRY_CODE);
}

function findState(stateName) {
  const name = String(stateName || '').trim().toLowerCase();
  return getStateRecords().find((state) => state.name.toLowerCase() === name);
}

function getStates() {
  return getStateRecords().map((state) => state.name);
}

function getDistricts(stateName) {
  const state = findState(stateName);
  if (!state) return [];
  const seen = new Set();
  return City.getCitiesOfState(INDIA_COUNTRY_CODE, state.isoCode)
    .map((city) => city.name)
    .filter((cityName) => {
      if (seen.has(cityName)) return false;
      seen.add(cityName);
      return true;
    });
}

function isValidStateDistrict(state, district) {
  const districts = getDistricts(state);
  return districts.includes(district);
}

module.exports = {
  getStates,
  getDistricts,
  isValidStateDistrict,
};
