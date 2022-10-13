import { assign, createMachine } from 'xstate';

// State Machine that describes the "double click then pan to zoom behavior"
export const doubleClickZooming =
	/** @xstate-layout N4IgpgJg5mDOIC5QQEYBsD6AvA9jgtgHQCWAdgIYDGALsQG5gDE1OArpQBazXkBO1iUAAccsYrRylBIAB6IAjAFYADIQAcigCzyAbAGYduvXoDsBgDQgAnogCciwppPy9agExKdb+5rcBfP0tUTFwCQhZ2DjIoZjZObj4BJBARMQkpZLkEPXtCb009XTVbNxMdW1tLGwRcpxd3T28tf0CQYOw8InaIzmjGABEAJQBBAHFpVPFiSWksnR0TPOU1TWV5NXkPLU0quwc61y2vHxbW0hwIOGl20KIyKloGCdEpmczEX12EYsJbHTUTICTG5lppbGYAkF0B0wj0oqQoM80tMMqAsqU1IQ9Fp5LZNDpNO5FGoVl8fn8AWC1DplOUSopIW1obdCN04vDEclJulZohFG43IQTHi9E4SvjbPIdtZEOT-iYqTS6W4dIybp1CLdokjXqjZIgyposeUVsZAUr5GTbL95UCQStwZo1czOjqee8EOsvusAgEgA */
	createMachine(
		{
			tsTypes: {} as import('./zoomMachine.typegen').Typegen0,
			schema: {
				context: {} as { map?: google.maps.Map; zoomSpeed: number; x?: number; y?: number, yAnchor?: number },
				events: {} as
					| { type: 'touchstart', y: number }
					| { type: 'pan'; x: number; y: number }
					| { type: 'touchend' }
					| { type: 'mapLoaded'; map: google.maps.Map }
					| { type: 'boundsChanged'; bounds: google.maps.LatLngBounds }
					| { type: 'setAnchor'; anchor: number }
					| { type: 'disablePan' }
					| { type: 'enablePan' }
			},
			predictableActionArguments: true,
			id: 'dbl_zoom',
			initial: 'inactive',
			context: {
				map: undefined,
				zoomSpeed: 0.005,
				x: undefined,
				y: undefined,
				yAnchor: undefined
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
							target: 'touching'
						}
					}
				},
				touching: {
					on: {
						touchstart: {
							target: 'dbl_touching'
						},
						touchend: {
							target: 'dbl_touch_waiting'
						}
					}
				},
				dbl_touch_waiting: {
					on: {
						touchstart: {
							target: 'dbl_touching',
							actions: ['setAnchor'],
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
							target: 'zooming'
						},
						touchend: {
							target: 'active'
						}
					}
				},
				zooming: {
					entry: ['disablePan'],
					exit: ['enablePan'],
					on: {
						touchend: {
							target: 'active'
						},
						pan: {
							target: 'zooming',
							actions: ['changeBounds']
						}
					}
				}
			}
		},
		{
			actions: {
				setMap: (ctx, e) => {
					ctx.map = e.map;
				},
				changeBounds: (ctx, e) => {
					if (ctx.x === undefined || ctx.y === undefined) {
						ctx.x = e.x;
						ctx.y = e.y;
						return;
					}
					// increase zoom level
					const zoom = ctx.map.getZoom();
					const newZoom = zoom + (e.y - ctx.y) * ctx.zoomSpeed;
					ctx.map?.moveCamera({
						zoom: newZoom,
					});

					ctx.x = e.x;
					ctx.y = e.y;
				},
				setAnchor: (ctx, e) => {
					ctx.yAnchor = e.y;
				},
				disablePan: (ctx, e) => {
					ctx.map?.setOptions({
						gestureHandling: 'none'
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
