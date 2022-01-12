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

export type AppTouchInput = MovementData & ReturnType<typeof getEmitData>;

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
				passive: false,
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
				once: true,
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
				once: true,
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
]);

let isDragging = false;
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
	if (!waitingForFrame) {
		waitingForFrame = true;
		window.requestAnimationFrame(() => _handlePanMove(event));
	}
}

function _handlePanMove(event: FlexibleTouchEvent) {
	waitingForFrame = false;

	if (!startCoords) {
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
		if (shouldCancel) {
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
	if (isDragging) {
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
	let screenX = startCoords?.x || 0;
	let screenY = startCoords?.y || 0;

	if (event instanceof MouseEvent) {
		screenX = event.screenX;
		screenY = event.screenY;
	} else if (isTouchEvent(event)) {
		const touches = [...event.touches, ...event.changedTouches];
		const touch = touches.length > 0 ? touches[0] : lastMovementData;
		if (touch) {
			screenX = touch.screenX;
			screenY = touch.screenY;
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

function getEmitData(event: FlexibleTouchEvent, data: MovementData) {
	let x = 0;
	let y = 0;

	if (event instanceof MouseEvent) {
		x = event.clientX;
		y = event.clientY;
	} else if (isTouchEvent(event)) {
		// If this is a touchEnd event, we may only get data from
		// [changedTouches]. Grab them all, just in case.
		const touchEvents = [...event.touches, ...event.changedTouches];

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

function isTouchEvent(event: FlexibleTouchEvent) {
	// Desktop firefox will freak out and break if we don't do something like
	// this before calling `instanceof TouchEvent`.
	return typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent;
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
