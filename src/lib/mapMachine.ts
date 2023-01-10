import { assign, createMachine, interpret } from 'xstate';

// State Machine that handles all UI interactions for the map
export const mapMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5QQEYBsD6AvA9jgtgHQCWAdgIYDGALsQG5gDE1OArpQBazXkBO1iUAAccsYrRylBIAB6IAjAFYADIQAcigCzyAbAGYduvXoDsBgDQgAnogCciwppPy9agExKdb+5rcBfP0tUTFwCQhZ2DjIoZjZObj4BJBARMQkpZLkEPXtCb009XTVbNxMdW1tLGwRcpxd3T28tf0CQYOw8InaIzmjGABEAJQBBAHFpVPFiSWksnR0TPOU1TWV5NXkPLU0quwc61y2vHxbW0hwIOGl20KIyKloGCdEpmczEX12EYsJbHTUTICTG5lppbGYAkF0B0wj0oqQoM80tMMqAsqU1IQ9Fp5LZNDpNO5FGoVl8fn8AWC1DplOUSopIW1obdCN04vDEclJulZohFG43IQTHi9E4SvjbPIdtZEOT-iYqTS6W4dIybp1CLdokjXqjZIgyposeUVsZAUr5GTbL95UCQStwZo1czOjqee8EOsvusAgEgA */
	createMachine(
		{
			tsTypes: {} as import("./mapMachine.typegen").Typegen0,
			schema: {
				context: {} as {
					map: google.maps.Map; zoomSpeed: number; zoom?: number; x?: number; y?: number, secondTouch: {
						x: number;
						y: number;
					}, firstTouch: {
						x: number;
						y: number;
					},
					firstPersonMarker: {
						marker: google.maps.Marker;
						placed: boolean;
					}
					secondPersonMarker: {
						marker: google.maps.Marker;
						placed: boolean;
					},
					lastMarkerPlaced: 'firstPersonMarker' | 'secondPersonMarker' | undefined;
				},
				events: {} as
					| { type: 'touchstart', x: number, y: number }
					| { type: 'touchmove', x: number, y: number }
					| { type: 'placeMarker' }
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
			predictableActionArguments: true,
			id: 'dbl_zoom',
			initial: 'inactive',
			context: {
				map: undefined as any,
				zoomSpeed: 0.010,
				zoom: undefined,
				x: undefined,
				y: undefined,
				firstTouch: {
					x: 0,
					y: 0,
				},
				secondTouch: {
					x: 0,
					y: 0,
				},
				firstPersonMarker: undefined as any,
				secondPersonMarker: undefined as any,
				lastMarkerPlaced: undefined,
			},
			states: {
				inactive: {
					on: {
						mapLoaded: {
							actions: ['setMap'],
							target: 'active'
						}
					}
				},
				active: {
					on: {
						touchstart: {
							target: 'touching',
							actions: ['setFirstTouch'],
						}
					}
				},
				touching: {
					on: {
						drag: {
							target: 'moving',
						},
						touchstart: {
							target: 'dbl_touching'
						},
						touchend: {
							target: 'dbl_touch_waiting'
						},
					},
					after: {
						800: {
							actions: ['placeMarker']
						},
					},
				},
				moving: {
					on: {
						touchend: {
							target: 'active',
						}
					},
				},
				dbl_touch_waiting: {
					on: {
						touchstart: {
							target: 'dbl_touching',
							actions: ['setSecondTouch'],
							// touch target area is a 20 unit square
							cond: (context, event) => Math.abs(context.firstTouch.y - event.y) <= 20 && Math.abs(context.firstTouch.x - event.x) <= 20
						},
					},
					after: {
						300: {
							target: 'active'
						}
					}
				},
				dbl_touching: {
					on: {
						pan: {
							target: 'zooming',
							cond: (context, event) => (Math.abs(event.y - context.secondTouch.y) > 20)
						},
						touchend: {
							target: 'active'
						},
					},
				},
				zooming: {
					entry: ['disablePan'],
					exit: ['enablePan'],
					on: {
						pan: {
							target: 'zooming',
							actions: ['zoom']
						},
						touchend: {
							target: 'active',
							actions: ['clearXY'],
						},
					}
				}
			}
		},
		{
			actions: {
				setMap: assign({
					map: (context, event) => event.map,
					firstPersonMarker: (context, event) => {
						return {
							marker: new google.maps.Marker({
								map: event.map,
							}),
							placed: false,
						}
					},
					secondPersonMarker: (context, event) => {
						return {
							marker: new google.maps.Marker({
								map: event.map,
							}),
							placed: false,
						}
					},
				}),
				setFirstTouch: (ctx, e) => {
					ctx.firstTouch.y = e.y;
					ctx.firstTouch.x = e.x;
				},
				placeMarker: (ctx, e) => {
					if (ctx.lastMarkerPlaced === undefined) {
						placeMarker({
							marker: ctx.firstPersonMarker.marker,
							x: ctx.firstTouch.x,
							y: ctx.firstTouch.y,
							map: ctx.map,
						})
						ctx.firstPersonMarker.placed = true;
						ctx.lastMarkerPlaced = 'firstPersonMarker';
					} else if (ctx.lastMarkerPlaced === 'firstPersonMarker') {
						placeMarker({
							marker: ctx.secondPersonMarker.marker,
							x: ctx.firstTouch.x,
							y: ctx.firstTouch.y,
							map: ctx.map,
						})
						ctx.secondPersonMarker.placed = true;
						ctx.lastMarkerPlaced = 'secondPersonMarker';
					} else {
						placeMarker({
							marker: ctx.firstPersonMarker.marker,
							x: ctx.firstTouch.x,
							y: ctx.firstTouch.y,
							map: ctx.map,
						})
						ctx.lastMarkerPlaced = 'firstPersonMarker';
					}
				},
				zoom: (ctx, e) => {
					if (ctx.x === undefined || ctx.y === undefined) {
						ctx.x = e.x;
						ctx.y = e.y;
						return;
					}

					const newZoom = ctx.map?.getZoom() + ((e.y - ctx.y)) * ctx.zoomSpeed;
					ctx.map?.moveCamera({
						zoom: newZoom,
					});


					ctx.x = e.x;
					ctx.y = e.y;

				},
				setSecondTouch: (ctx, e) => {
					ctx.secondTouch.x = e.x;
					ctx.secondTouch.y = e.y;
				},
				clearXY: assign({
					x: (ctx, e) => {
						return undefined;
					},
					y: (ctx, e) => {
						return undefined;
					}
				}),
				disablePan: (ctx, e) => {
					ctx.map?.setOptions({
						gestureHandling: 'none',
					});
				},
				enablePan: (ctx, e) => {
					ctx.map?.setOptions({
						gestureHandling: 'greedy'
					});
				}
			}
		}
	);

export const mapService = interpret(mapMachine).start();


function placeMarker({
	x,
	y,
	map,
	marker,
}: {
	x: number;
	y: number;
	map: google.maps.Map;
	marker: google.maps.Marker;
}) {
	const bounds = map.getBounds();
	const ne = bounds.getNorthEast();
	const sw = bounds.getSouthWest();
	const width = Math.abs(ne.lng() - sw.lng());
	const height = Math.abs(ne.lat() - sw.lat());
	const xRatio = x / map.getDiv().clientWidth;
	const yRatio = y / map.getDiv().clientHeight;
	const lat = ne.lat() - (yRatio * height);
	const lng = sw.lng() + (xRatio * width);
	const latLng = new google.maps.LatLng(lat, lng);
	marker.setPosition(latLng);
	map.panTo(latLng);
}

