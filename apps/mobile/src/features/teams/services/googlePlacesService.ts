import { Platform } from 'react-native';

import { env } from '../../../config/env';

export type PlacePrediction = {
  description: string;
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  addressDistrict: string;
  addressLine: string;
  addressNumber: string;
  name: string;
  postalCode: string;
  regionCity: string;
  regionState: string;
  regionZone: string;
};

type MapsAddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type GoogleMapsNamespace = {
  maps: {
    importLibrary?: (libraryName: string) => Promise<unknown>;
    places: {
      AutocompleteSessionToken: new () => unknown;
      Place: new (options: { id?: string; resourceName?: string }) => {
        addressComponents?: Array<{
          longText?: string;
          shortText?: string;
          types?: string[];
        }>;
        displayName?: string;
        fetchFields: (request: { fields: string[] }) => Promise<void>;
        formattedAddress?: string;
      };
      AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{
          suggestions?: Array<{
            placePrediction?: {
              mainText?: {
                text?: string;
              };
              place?: string;
              placeId?: string;
              secondaryText?: {
                text?: string;
              };
              text?: {
                text?: string;
              };
            };
          }>;
        }>;
      };
    };
  };
};

const AUTOCOMPLETE_ENDPOINT = 'https://places.googleapis.com/v1/places:autocomplete';
const PLACE_DETAILS_ENDPOINT = 'https://places.googleapis.com/v1/places';
const GOOGLE_MAPS_CALLBACK_NAME = '__futstatsGoogleMapsReady';
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-places-script';

let googleMapsScriptPromise: Promise<GoogleMapsNamespace> | null = null;
let webAutocompleteSessionToken: unknown | null = null;
const webPlacePredictionStore = new Map<
  string,
  {
    resourceName?: string;
  }
>();

export async function searchVenuePredictions(query: string) {
  if (!env.googleMapsApiKey) {
    throw new Error('A chave do Google Maps não está configurada.');
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 3) {
    return [];
  }

  if (Platform.OS === 'web') {
    return searchVenuePredictionsOnWeb(trimmedQuery);
  }

  return searchVenuePredictionsByHttp(trimmedQuery);
}

export async function fetchVenueDetails(placeId: string): Promise<PlaceDetails> {
  if (!env.googleMapsApiKey) {
    throw new Error('A chave do Google Maps não está configurada.');
  }

  if (Platform.OS === 'web') {
    return fetchVenueDetailsOnWeb(placeId);
  }

  return fetchVenueDetailsByHttp(placeId);
}

async function searchVenuePredictionsOnWeb(query: string) {
  const google = await ensureGoogleMapsPlacesLibrary();

  if (!webAutocompleteSessionToken) {
    webAutocompleteSessionToken = new google.maps.places.AutocompleteSessionToken();
  }

  const response = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    includedRegionCodes: ['BR'],
    input: query,
    language: 'pt-BR',
    sessionToken: webAutocompleteSessionToken,
  });

  const predictions = (response.suggestions ?? [])
    .map((entry) => entry.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> => Boolean(prediction?.placeId));

  webPlacePredictionStore.clear();

  return predictions.map((prediction) => {
    const placeId = prediction.placeId ?? '';
    webPlacePredictionStore.set(placeId, { resourceName: prediction.place });

    return {
      description: prediction.text?.text ?? prediction.mainText?.text ?? '',
      placeId,
      primaryText: prediction.mainText?.text ?? prediction.text?.text ?? '',
      secondaryText: prediction.secondaryText?.text ?? '',
    };
  });
}

async function fetchVenueDetailsOnWeb(placeId: string) {
  const google = await ensureGoogleMapsPlacesLibrary();
  const storedPrediction = webPlacePredictionStore.get(placeId);
  webAutocompleteSessionToken = null;
  const resourceName = storedPrediction?.resourceName;
  const place = new google.maps.places.Place(
    resourceName ? { resourceName } : { id: placeId },
  );

  await place.fetchFields({
    fields: ['addressComponents', 'displayName', 'formattedAddress'],
  });

  const normalizedComponents: MapsAddressComponent[] = (place.addressComponents ?? []).map((component) => ({
    long_name: component.longText,
    short_name: component.shortText,
    types: component.types,
  }));

  return mapVenueDetailsFromComponents(
    normalizedComponents,
    place.formattedAddress ?? '',
    place.displayName ?? '',
  );
}

async function searchVenuePredictionsByHttp(query: string) {
  const response = await fetch(AUTOCOMPLETE_ENDPOINT, {
    body: JSON.stringify({
      includedRegionCodes: ['BR'],
      input: query,
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googleMapsApiKey ?? '',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Não foi possível consultar locais agora.');
  }

  const payload = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        structuredFormat?: {
          mainText?: {
            text?: string;
          };
          secondaryText?: {
            text?: string;
          };
        };
        text?: {
          text?: string;
        };
      };
    }>;
  };

  return (payload.suggestions ?? [])
    .map((entry) => entry.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> => Boolean(prediction?.placeId))
    .map((prediction) => ({
      description: prediction.text?.text ?? prediction.structuredFormat?.mainText?.text ?? '',
      placeId: prediction.placeId ?? '',
      primaryText: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? '',
      secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
    }));
}

async function fetchVenueDetailsByHttp(placeId: string) {
  const placePath = placeId.startsWith('places/') ? placeId : `places/${placeId}`;
  const response = await fetch(`https://places.googleapis.com/v1/${placePath}`, {
    headers: {
      'X-Goog-Api-Key': env.googleMapsApiKey ?? '',
      'X-Goog-FieldMask': 'addressComponents,formattedAddress,displayName',
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os detalhes do local.');
  }

  const payload = (await response.json()) as {
    addressComponents?: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }>;
    displayName?: {
      text?: string;
    };
    formattedAddress?: string;
  };

  const normalizedComponents: MapsAddressComponent[] = (payload.addressComponents ?? []).map((component) => ({
    long_name: component.longText,
    short_name: component.shortText,
    types: component.types,
  }));

  return mapVenueDetailsFromComponents(
    normalizedComponents,
    payload.formattedAddress ?? '',
    payload.displayName?.text ?? '',
  );
}

function mapVenueDetailsFromComponents(
  addressComponents: MapsAddressComponent[],
  formattedAddress: string,
  placeName: string,
): PlaceDetails {
  const route = getAddressComponent(addressComponents, 'route');
  const streetNumber = getAddressComponent(addressComponents, 'street_number');
  const neighborhood =
    getAddressComponent(addressComponents, 'sublocality_level_1') ||
    getAddressComponent(addressComponents, 'sublocality') ||
    getAddressComponent(addressComponents, 'neighborhood');
  const city =
    getAddressComponent(addressComponents, 'locality') ||
    getAddressComponent(addressComponents, 'administrative_area_level_2');
  const state =
    getAddressComponent(addressComponents, 'administrative_area_level_1') ||
    getAddressComponent(addressComponents, 'administrative_area_level_2');
  const postalCode = getAddressComponent(addressComponents, 'postal_code');

  return {
    addressDistrict: neighborhood,
    addressLine: route || formattedAddress || '',
    addressNumber: streetNumber,
    name: placeName.trim(),
    postalCode,
    regionCity: city,
    regionState: state,
    regionZone: neighborhood,
  };
}

function getAddressComponent(components: MapsAddressComponent[], type: string) {
  const component = components.find((entry) => entry.types?.includes(type));
  return component?.long_name?.trim() || component?.short_name?.trim() || '';
}

async function ensureGoogleMapsPlacesLibrary() {
  if (Platform.OS !== 'web') {
    throw new Error('A biblioteca do Google Maps para web não está disponível aqui.');
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('O ambiente atual não suporta o carregamento do Google Maps.');
  }

  const googleWindow = window as typeof window & { google?: GoogleMapsNamespace };
  if (googleWindow.google?.maps?.places) {
    return googleWindow.google;
  }

  if (!env.googleMapsApiKey) {
    throw new Error('A chave do Google Maps não está configurada.');
  }

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
      const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

      if (existingScript) {
        const fallbackTimeout = window.setTimeout(() => {
          void hydratePlacesLibrary(googleWindow)
            .then(resolve)
            .catch(reject);
        }, 400);

        existingScript.addEventListener('error', () => {
          window.clearTimeout(fallbackTimeout);
          reject(new Error('Não foi possível carregar a biblioteca do Google Maps.'));
        });
        return;
      }

      const windowWithCallback = window as typeof window & {
        [GOOGLE_MAPS_CALLBACK_NAME]?: () => void;
      };

      const script = document.createElement('script');
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        env.googleMapsApiKey,
      )}&libraries=places&loading=async&v=weekly&callback=${GOOGLE_MAPS_CALLBACK_NAME}`;

      windowWithCallback[GOOGLE_MAPS_CALLBACK_NAME] = () => {
        void hydratePlacesLibrary(googleWindow)
          .then(resolve)
          .catch(reject);
      };

      script.onerror = () => {
        delete windowWithCallback[GOOGLE_MAPS_CALLBACK_NAME];
        reject(new Error('Não foi possível carregar a biblioteca do Google Maps.'));
      };

      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
}

async function hydratePlacesLibrary(googleWindow: typeof window & { google?: GoogleMapsNamespace }) {
  if (!googleWindow.google?.maps) {
    throw new Error('O Google Maps não ficou disponível após o carregamento do script.');
  }

  if (googleWindow.google.maps.places) {
    return googleWindow.google;
  }

  if (typeof googleWindow.google.maps.importLibrary === 'function') {
    await googleWindow.google.maps.importLibrary('places');
  }

  if (googleWindow.google.maps.places) {
    return googleWindow.google;
  }

  throw new Error('O Google Maps carregou sem a biblioteca de lugares.');
}
