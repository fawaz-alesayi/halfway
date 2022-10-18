import { mapMachine } from '$lib/mapMachine';
import { actions, assign, createMachine, interpret, spawn } from 'xstate';


const markerMachine = createMachine({
    tsTypes: {} as import("./markerMachine.typegen").Typegen0,
    schema: {
        context: {} as {
            map: google.maps.Map;
            firstPersonMarker: google.maps.Marker;
            secondPersonMarker: google.maps.Marker;
            // Ref's to the mapMachines
            mapMachines: string[],
        },
        events: {} as
            | { type: 'placeFirstMarker' }
            | { type: 'placeSecondMarker' }
            | { type: 'mapLoaded'; map: google.maps.Map }
            | { type: 'touchstart', x: number, y: number }
            | { type: 'touchmove', x: number, y: number }
            | { type: 'pan'; x: number; y: number }
            | { type: 'touchend' }
            | { type: 'mapLoaded'; map: google.maps.Map }
            | { type: 'zoom'; x: number; y: number }
            | { type: 'setSecondTouch'; x: number, y: number }
            | { type: 'disablePan' }
            | { type: 'enablePan' }
            | { type: 'clearXY'; }
            | { type: 'drag'; }
    },
    id: 'marker',
    initial: 'firstMarker',
    predictableActionArguments: true,
    preserveActionOrder: true,
    context: {
        map: undefined as any,
        firstPersonMarker: undefined as any,
        secondPersonMarker: undefined as any,
        mapMachines: [],
    },
    states: {
        idle: {
            on: {
                mapLoaded: {
                    actions: ['setMap'],
                    target: 'firstMarker'
                }
            }
        },
        firstMarker: {
            entry: assign({
                mapMachines: (context, event) => {
                    const machine = mapMachine.withContext({
                        ...mapMachine.context,
                        map: context.map,
                        firstPersonMarker: context.firstPersonMarker,
                        secondPersonMarker: context.secondPersonMarker,
                    });
                    return [...context.mapMachines, spawn(machine, {
                        autoForward: true,
                    })];
                },
            }),
        },
        on: {
            next: 'secondMarker',
        },
    },
    secondMarker: {
        entry: assign({
            mapMachines: (context, event) => {
                const machine = mapMachine.withContext({
                    ...mapMachine.context,
                    map: context.map,
                    firstPersonMarker: context.firstPersonMarker,
                    secondPersonMarker: context.secondPersonMarker,
                });
                return [...context.mapMachines, spawn(machine, {
                    autoForward: true,
                })];
            },
        }),
        on: {
            reset: 'firstMarker',
        }
    },
},
    {
        actions: {
            setMap: assign({
                map: (context, event) => event.map,
                firstPersonMarker: (context, event) => new google.maps.Marker({
                    map: event.map,
                }),
                secondPersonMarker: (context, event) => new google.maps.Marker({
                    map: event.map,
                }),
            }),
        }
    }
);

export const markerService = interpret(markerMachine).start();