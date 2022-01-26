<script lang="ts">
import { computed, onUnmounted } from 'vue';

declare class MovementData {
	/** Movement of the X axis. */
	deltaX: number;
	/** Movement of the Y axis. */
	deltaY: number;
	/** Distance moved. */
	distance: number;
	/** Velocity on the X axis, in px/ms. */
	velocityX: number;
	/** Velocity on the Y axis, in px/ms */
	velocityY: number;
}

declare class MovementDataExtras {
	timestamp: number;
	absDeltaX: number;
	absDeltaY: number;
	movementX: number;
	movementY: number;
	screenX: number;
	screenY: number;
}

export type AppTouchInput = MovementData & {
	preventDefault: () => void;
	target: HTMLElement;
	center: { x: number; y: number };
	pointer: FlexibleTouchEvent;
};

type VerticalOption = 'up' | 'down' | 'vertical' | 'all';
type HorizontalOption = 'left' | 'right' | 'horizontal' | 'all';
type AppTouchDirection = HorizontalOption | VerticalOption;

type FlexibleTouchEvent = MouseEvent | TouchEvent;

type Coordinates = {
	x: number;
	y: number;
};

type TimestampedCoordinates = Coordinates & {
	timestamp: number;
};

interface PanOptions {
	direction?: AppTouchDirection;
	threshold?: number;
}

export function isTouchEvent(event: FlexibleTouchEvent): event is TouchEvent {
	// Desktop firefox will freak out and break if we don't do something like
	// this before calling `instanceof TouchEvent`.
	return typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	panOptions: {
		required: false,
		type: Object,
		default: <PanOptions>{
			direction: 'all',
			threshold: 10,
		},
	},
});

const emit = defineEmits({
	panstart: (_event: AppTouchInput) => true,
	panmove: (_event: AppTouchInput) => true,
	panend: (_event: AppTouchInput) => true,
});

const listenerEvents = new Map<
	keyof HTMLElementEventMap,
	[EventListenerOrEventListenerObject, AddEventListenerOptions]
>([
	[
		'touchmove',
		[
			(event: TouchEvent) => {
				// Call both - [onTouchMove] might not get triggered on our root
				// element, so we need it here as well.
				onPanMove(event);
				onTouchMove(event);
			},
			{
				capture: true,
			},
		],
	],
	[
		'mousemove',
		[
			onPanMove,
			{
				passive: true,
				capture: true,
			},
		],
	],
	[
		'mouseup',
		[
			onPanEnd,
			{
				passive: true,
				capture: true,
				once: true,
			},
		],
	],
	[
		'touchend',
		[
			onPanEnd,
			{
				passive: true,
				capture: true,
			},
		],
	],
	[
		'touchcancel',
		[
			onPanEnd,
			{
				passive: true,
				capture: true,
			},
		],
	],
	[
		'contextmenu',
		[
			onPanEnd,
			{
				passive: true,
				capture: true,
				once: true,
			},
		],
	],
	[
		'dragstart',
		[
			(event: FlexibleTouchEvent) => {
				_preventEvents(event);
				onPanEnd(event);
			},
			{
				passive: false,
				capture: true,
				once: true,
			},
		],
	],
]);

let isDragging = false;
let prevented = false;
let startCoords: TimestampedCoordinates | null = null;
let lastCoords: TimestampedCoordinates | null = null;
let lastMovementData: (MovementData & MovementDataExtras) | null = null;
let attachedListeners: typeof listenerEvents | null = null;

let didEmitStart = false;
let didEmitEnd = false;
let waitingForFrame = false;

onUnmounted(() => {
	cleanup();
});

const direction = computed<HorizontalOption | VerticalOption>(() => {
	if (props.panOptions.direction) {
		return props.panOptions.direction;
	}
	return 'all';
});

const threshold = computed<number>(() => {
	const t = props.panOptions.threshold;
	if (typeof t === 'number' && t >= 0) {
		return t;
	}
	return 10;
});

const canHorizontal = computed(() => {
	const d = direction.value;
	return d === 'all' || d === 'horizontal' || d === 'left' || d === 'right';
});

const canVertical = computed(() => {
	const d = direction.value;
	return d === 'all' || d === 'vertical' || d === 'up' || d === 'down';
});

function onPanStart(event: FlexibleTouchEvent) {
	if (prevented) {
		event.preventDefault();
		return;
	}

	if (startCoords) {
		return;
	}

	startCoords = getCoordinatesFromEvent(event);

	if (!attachedListeners) {
		attachedListeners = listenerEvents;
		for (const [name, [callback, options]] of attachedListeners) {
			window.addEventListener(name, callback, options);
		}
	}

	if (threshold.value === 0) {
		isDragging = true;
		const data = getMovementData(event);
		emitPanStart(getEmitData(event, data));
	}
}

function onPanMove(event: FlexibleTouchEvent) {
	if (prevented) {
		event.preventDefault();
		return;
	}

	if (!waitingForFrame) {
		waitingForFrame = true;
		window.requestAnimationFrame(() => _handlePanMove(event));
	}
}

function _handlePanMove(event: FlexibleTouchEvent) {
	waitingForFrame = false;

	if (!startCoords || _getUniqueTouches(event).length > 1) {
		return;
	}

	const data = getMovementData(event);
	const { deltaX, deltaY, absDeltaX, absDeltaY, timestamp } = data;

	const { x: startX, y: startY } = startCoords;
	lastCoords = { x: startX + deltaX, y: startY + deltaY, timestamp };

	if (!isDragging) {
		const threshold_ = threshold.value;

		const canHorizontal_ = canHorizontal.value;
		const canVertical_ = canVertical.value;
		const isHorizontal = absDeltaX > threshold_;
		const isVertical = absDeltaY > threshold_;

		isDragging = (canHorizontal_ && isHorizontal) || (canVertical_ && isVertical);

		const isNaughtyHorizontal = !canHorizontal_ && isHorizontal;
		const isNaughtyVertical = !canVertical_ && isVertical;
		const isMoreHorizontal = absDeltaX >= absDeltaY;

		const shouldCancel =
			(isNaughtyHorizontal && isMoreHorizontal) || (isNaughtyVertical && !isMoreHorizontal);

		// If we go past the threshold for a direction that isn't allowed, treat
		// this as the end of a pan and clean up.
		//
		// This should only matter for touch events, where drags can either be
		// scroll events or the start of navigation events.
		if (isTouchEvent(event) && shouldCancel) {
			_preventEvents(event);
			// Manually reset [didEmitEnd] so that future events are handled properly.
			didEmitEnd = false;
			onPanEnd(event, true);
			return;
		}
	}

	if (!isDragging) {
		return;
	}

	const emitData = getEmitData(event, data);

	if (!didEmitStart) {
		emitPanStart(emitData);
	}

	emit('panmove', emitData);
}

function onPanEnd(event: FlexibleTouchEvent, force = false) {
	if (isTouchEvent(event) && _getUniqueTouches(event).length > 1) {
		// We still have a touch giving us events
		return;
	}

	if (!didEmitStart) {
		cleanup();
		return;
	}

	if (!didEmitEnd && (isDragging || force)) {
		const data = getMovementData(event);
		emitPanEnd(getEmitData(event, data));
	}
}

function onTouchMove(event: TouchEvent) {
	if (isDragging || prevented) {
		event.preventDefault();
		return;
	}

	const data = getMovementData(event);
	const { absDeltaX, absDeltaY } = data;

	const shouldPrevent =
		(absDeltaX > absDeltaY && canHorizontal.value) ||
		(absDeltaX < absDeltaY && canVertical.value);

	if (shouldPrevent) {
		event.preventDefault();
	}
}

function getCoordinatesFromEvent(event: FlexibleTouchEvent): TimestampedCoordinates {
	let screenX = 0;
	let screenY = 0;

	if (event instanceof MouseEvent) {
		screenX = event.screenX;
		screenY = event.screenY;
	} else if (isTouchEvent(event)) {
		const touches = _getUniqueTouches(event);

		if (!touches.length) {
			screenX = startCoords?.x || 0;
			screenY = startCoords?.y || 0;
		} else {
			for (const touch of touches) {
				screenX += touch.screenX;
				screenY += touch.screenY;
			}
			screenX = Math.round(screenX / touches.length);
			screenY = Math.round(screenY / touches.length);
		}
	}

	return { x: screenX, y: screenY, timestamp: Date.now() };
}

function getMovementData(event: FlexibleTouchEvent) {
	const { x: screenX, y: screenY, timestamp } = getCoordinatesFromEvent(event);
	const msDiff = !lastCoords ? 0 : timestamp - lastCoords.timestamp;

	const { x: startX = screenX, y: startY = screenY } = startCoords || {};

	const deltaX = screenX - startX;
	const deltaY = screenY - startY;
	const absDeltaX = Math.abs(deltaX);
	const absDeltaY = Math.abs(deltaY);

	const {
		movementX: lastMoveX = 0,
		movementY: lastMoveY = 0,
		deltaX: lastDeltaX = 0,
		deltaY: lastDeltaY = 0,
	} = lastMovementData || {};

	const movementX = lastDeltaX !== deltaX ? deltaX - lastDeltaX : lastMoveX;
	const movementY = lastDeltaY !== deltaY ? deltaY - lastDeltaY : lastMoveY;

	const velocityX = movementX === 0 ? 0 : movementX / msDiff;
	const velocityY = movementY === 0 ? 0 : movementY / msDiff;
	const distance = Math.sqrt(Math.pow(absDeltaX, 2) + Math.pow(absDeltaY, 2));

	lastMovementData = {
		deltaX,
		deltaY,
		distance,
		velocityX,
		velocityY,
		absDeltaX,
		absDeltaY,
		timestamp,
		movementX,
		movementY,
		screenX,
		screenY,
	};
	return lastMovementData;
}

function getEmitData(event: FlexibleTouchEvent, data: MovementData): AppTouchInput {
	let x = 0;
	let y = 0;

	if (event instanceof MouseEvent) {
		x = event.clientX;
		y = event.clientY;
	} else if (isTouchEvent(event)) {
		const touchEvents = _getUniqueTouches(event);

		for (const touch of touchEvents) {
			x += touch.clientX;
			y += touch.clientY;
		}

		x = Math.round(x / touchEvents.length);
		y = Math.round(y / touchEvents.length);
	}

	return {
		...data,
		preventDefault: () => event.preventDefault(),
		target: event.target as HTMLElement,
		center: { x, y },
		pointer: event,
	};
}

function emitPanStart(event: AppTouchInput) {
	if (didEmitStart) {
		return;
	}

	emit('panstart', event);
	didEmitStart = true;
	didEmitEnd = false;
}

function emitPanEnd(event: AppTouchInput) {
	if (didEmitEnd) {
		return;
	}

	emit('panend', event);
	didEmitEnd = true;
	cleanup();
}

function _preventEvents(event: Event) {
	prevented = true;
	event.preventDefault();
}

function _getUniqueTouches(event: FlexibleTouchEvent) {
	if (!isTouchEvent(event)) {
		return [];
	}

	const touchEvents = [...event.touches, ...event.changedTouches];
	const result: Touch[] = [];

	const trackedIds: Record<number, boolean> = {};

	touchEvents.forEach(i => {
		if (trackedIds[i.identifier]) {
			return;
		}
		result.push(i);
		trackedIds[i.identifier] = true;
	});

	return result;
}

/** Resets all data except for [didEmitEnd] */
function cleanup() {
	isDragging = false;
	startCoords = null;
	lastCoords = null;
	lastMovementData = null;

	didEmitStart = false;
	waitingForFrame = false;

	for (const [name, [callback, options]] of attachedListeners || listenerEvents) {
		window.removeEventListener(name, callback, options);
	}

	attachedListeners = null;
	prevented = false;
}
</script>

<template>
	<div
		@touchmove.capture="onTouchMove"
		@mousedown.capture="onPanStart"
		@touchstart.capture="onPanStart"
	>
		<slot />
	</div>
</template>
