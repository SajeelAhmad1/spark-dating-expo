import * as Location from 'expo-location'

export async function getCityFromCoords(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude:  lat,
      longitude: lng,
    })
    return address?.city ?? address?.subregion ?? address?.region ?? 'Unknown'
  } catch {
    return 'Unknown'
  }
}
