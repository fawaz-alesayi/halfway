import { assign, createMachine } from 'xstate';

// State Machine that describes the "double click then pan to zoom behavior"
export const doubleClickZooming =
	/** @xstate-layout N4IgpgJg5mDOIC5QQEYBsD6AvA9jgtgHQCWAdgIYDGALsQG5gDE1OArpQBazXkBO1iUAAccsYrRylBIAB6IAjAFYADIQAcigCzyAbAGYduvXoDsBgDQgAnogCciwppPy9agExKdb+5rcBfP0tUTFwCQhZ2DjIoZjZObj4BJBARMQkpZLkEPXtCb009XTVbNxMdW1tLGwRcpxd3T28tf0CQYOw8InaIzmjGABEAJQBBAHFpVPFiSWksnR0TPOU1TWV5NXkPLU0quwc61y2vHxbW0hwIOGl20KIyKloGCdEpmczEX12EYsJbHTUTICTG5lppbGYAkF0B0wj0oqQoM80tMMqAsqU1IQ9Fp5LZNDpNO5FGoVl8fn8AWC1DplOUSopIW1obdCN04vDEclJulZohFG43IQTHi9E4SvjbPIdtZEOT-iYqTS6W4dIybp1CLdokjXqjZIgyposeUVsZAUr5GTbL95UCQStwZo1czOjqee8EOsvusAgEgA */
	createMachine(
		{
			tsTypes: {} as import('./zoomMachine.typegen').Typegen0,
			schema: {
				context: {} as {
					map?: google.maps.Map; zoomSpeed: number; zoom?: number; x?: number; y?: number, secondTouch: {
						x: number;
						y: number;
					}, firstTouch: {
						x: number;
						y: number;
					},
					anchor: {
						x?: number;
						y?: number;
					}
				},
				events: {} as
					| { type: 'touchstart', x: number, y: number }
					| { type: 'pan'; x: number; y: number }
					| { type: 'touchend' }
					| { type: 'mapLoaded'; map: google.maps.Map }
					| { type: 'boundsChanged'; bounds: google.maps.LatLngBounds }
					| { type: 'setSecondTouch'; x: number, y: number }
					| { type: 'disablePan' }
					| { type: 'enablePan' }
					| { type: 'setAnchor'; x: number, y: number }
					| { type: 'clearAnchor'; }
					| { type: 'clearXY'; }
			},
			predictableActionArguments: true,
			id: 'dbl_zoom',
			initial: 'inactive',
			context: {
				map: undefined,
				zoomSpeed: 0.005,
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
				anchor: {
					x: undefined,
					y: undefined,
				},
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
							actions: ['setSecondTouch'],
							// touch target area is a 10 unit square
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
					exit: ['setAnchor'],
				},
				zooming: {
					entry: ['disablePan'],
					exit: ['enablePan'],
					on: {
						pan: {
							target: 'zooming',
							actions: ['changeBounds']
						},
						touchend: {
							target: 'active',
							actions: ['clearAnchor', 'clearXY']
						},
					}
				}
			}
		},
		{
			actions: {
				setMap: (ctx, e) => {
					ctx.map = e.map;
				},
				setFirstTouch: (ctx, e) => {
					ctx.firstTouch.y = e.y;
					ctx.firstTouch.x = e.x;
				},
				changeBounds: (ctx, e) => {
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
				setAnchor: assign({
					anchor: (ctx, e) => {
						return {
							x: e.x,
							y: e.y,
						};
					}
				}),
				clearAnchor: assign({
					anchor: (ctx, e) => {
						return {
							x: undefined,
							y: undefined,
						};
					}
				}),
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
