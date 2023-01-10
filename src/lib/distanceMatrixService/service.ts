export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface Waypoint {
    location: {
        latLng: LatLng;
    };
}

export interface RouteModifiers {
    avoid_ferries: boolean;
}

export interface Origin {
    waypoint: Waypoint;
    routeModifiers: RouteModifiers;
}

export interface Destination {
    waypoint: Waypoint;
}


export interface DistanceMatrixRequest {
    origins: Origin[];
    destinations: Destination[];
    travelMode: 'DRIVE';
    routingPreference: 'TRAFFIC_AWARE';
}

export const computeRouteMatrix = async (
    apiKey: string,
    request: DistanceMatrixRequest,
): Promise<Response> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Goog-Api-Key', apiKey);
    headers.append(
        'X-Goog-FieldMask',
        'originIndex,destinationIndex,duration,distanceMeters,status,condition',
    );

    const response = await fetch(
        'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
        {
            method: 'POST',
            body: JSON.stringify(request),
            headers,
        },
    );
    return response;

};
