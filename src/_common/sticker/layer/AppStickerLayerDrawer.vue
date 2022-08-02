<script lang="ts" setup>
import { computed, CSSProperties, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AppEventItemMediaIndicator from '../../../app/components/event-item/media-indicator/AppEventItemMediaIndicator.vue';
import { Analytics } from '../../analytics/analytics.service';
import { EscapeStack, EscapeStackCallback } from '../../escape-stack/escape-stack.service';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import { onScreenResize, Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import AppTouch, { AppTouchInput } from '../../touch/AppTouch.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import {
	setStickerDrawerHeight,
	setStickerDrawerOpen,
	setStickerStoreActiveItem,
	useStickerStore,
} from '../sticker-store';
import { Sticker, StickerStack } from '../sticker.model';
import AppStickerLayerDrawerItem from './AppStickerLayerDrawerItem.vue';

const stickerStore = useStickerStore();
const {
	sticker: storeSticker,
	drawerItems: items,
	stickerSize,
	drawerHeight,
	isHoveringDrawer,
	isDrawerOpen,
	isDragging,
	isLoading,
	hasLoaded,
} = stickerStore;

const _drawerPadding = 8;
const _stickerSpacing = 8;

let _touchedSticker: Sticker | null = null;
let _escapeCallback: EscapeStackCallback | null = null;

const sheetPage = ref(1);
const isSwiping = ref(false);
const _stickersPerRow = ref(5);

const root = ref<HTMLDivElement>();
const content = ref<HTMLDivElement>();
const slider = ref<HTMLDivElement>();

const effectiveStickerSize = computed(() => stickerSize.value + _stickerSpacing);

const drawerNavigationComponent = computed(() => (Screen.isPointerMouse ? 'div' : AppTouch));

const drawerNavigationProps = computed(() =>
	!Screen.isPointerMouse
		? {
				'pan-options': { threshold: 16 },
		  }
		: {}
);

const stickerSheets = computed(() => _chunkStickers(items.value));

const hasStickers = computed(() => !!items.value.length);

const maxStickersPerSheet = computed(() => {
	if (Screen.isPointerMouse) {
		// Don't worry, this is SAFE.
		return Number.MAX_SAFE_INTEGER;
	}

	const rows = 2;
	return _stickersPerRow.value * rows;
});

const numRowsShowing = computed(() => (Screen.isPointerMouse ? 2.3 : 2));

const styleShell = computed<CSSProperties>(() => {
	const result: CSSProperties = {
		transform: `translateY(0)`,
		left: Screen.isXs ? 0 : '64px',
		// Max-height of 2 sticker rows
		maxHeight: Screen.isPointerMouse
			? `${_drawerPadding * 2 + stickerSize.value * numRowsShowing.value}px`
			: undefined,
	};

	// Shift the drawer down when there's an item being dragged and the drawer
	// container is not being hovered.
	if (storeSticker.value && !isHoveringDrawer.value) {
		result.transform = `translateY(${drawerHeight.value - stickerSize.value / 2}px)`;
	}

	return result;
});

const styleOuter = computed<CSSProperties>(() => {
	const { stickerSize, isDragging } = stickerStore;

	return {
		cursor: isDragging.value ? 'grabbing' : 'default',
		paddingTop: `${_drawerPadding}px`,
		// Max-width is unset when Xs (so it can bleed and span the whole
		// width), with margins of 64px on other breakpoints.
		maxWidth: Screen.isXs ? 'unset' : `calc(100% - 64px)`,
		// Max-height of 2 sticker rows
		maxHeight: Screen.isPointerMouse
			? _drawerPadding * 2 + stickerSize.value * numRowsShowing.value + 'px'
			: undefined,
	};
});

const styleDimensions = computed<CSSProperties>(() => {
	const { stickerSize } = stickerStore;

	return {
		minWidth: Screen.isXs ? 'unset' : '400px',
		minHeight: `${stickerSize.value}px`,
		maxHeight: Screen.isPointerMouse
			? _drawerPadding + stickerSize.value * numRowsShowing.value + 'px'
			: undefined,
		paddingBottom: `${_drawerPadding}px`,
	};
});

const styleSheet = computed<CSSProperties>(() => ({
	padding: `0 ${_drawerPadding}px`,
	width: `100%`,
	height: `100%`,
}));

const styleStickers = computed<CSSProperties>(() => ({
	padding: '4px',
	marginRight: _stickerSpacing + 'px',
	marginBottom: _stickerSpacing + 'px',
}));

useEventSubscription(onScreenResize, calculateStickersPerRow);

watch(isLoading, onIsLoadingChange, { immediate: true });

onMounted(() => {
	calculateStickersPerRow();

	_escapeCallback = () => setStickerDrawerOpen(stickerStore, false);
	EscapeStack.register(_escapeCallback);
});

onBeforeUnmount(() => {
	if (_escapeCallback) {
		EscapeStack.deregister(_escapeCallback);
		_escapeCallback = null;
	}
});

function _chunkStickers(stickers: StickerStack[]) {
	const sheets = [];

	let current: StickerStack[] = [];
	for (const i of stickers) {
		current.push(i);

		if (current.length >= maxStickersPerSheet.value) {
			sheets.push(current);
			current = [];
		}
	}

	if (current.length > 0) {
		sheets.push(current);
	}

	return sheets;
}

function onClickMargin() {
	setStickerDrawerOpen(stickerStore, false);
}

// VueTouch things - START
function goNext() {
	if (sheetPage.value >= stickerSheets.value.length) {
		_updateSliderOffset();
		return;
	}

	sheetPage.value = Math.min(sheetPage.value + 1, stickerSheets.value.length);
	Analytics.trackEvent('sticker-drawer', 'swipe-next');
	_updateSliderOffset();
}

function goPrev() {
	if (sheetPage.value <= 1) {
		_updateSliderOffset();
		return;
	}

	sheetPage.value = Math.max(sheetPage.value - 1, 1);
	Analytics.trackEvent('sticker-drawer', 'swipe-previous');
	_updateSliderOffset();
}

function assignTouchedSticker(sticker: StickerStack) {
	if (!isDrawerOpen.value || storeSticker.value || sticker.count <= 0) {
		return;
	}

	_touchedSticker = sticker.sticker;
}

function onMouseMove(event: MouseEvent) {
	if (!_touchedSticker) {
		return;
	}

	setStickerStoreActiveItem(stickerStore, _touchedSticker, event);
	resetTouchedSticker();
}

function resetTouchedSticker() {
	_touchedSticker = null;
}

function panStart(event: AppTouchInput) {
	const { deltaX, deltaY } = event;
	if (Math.abs(deltaX) > Math.abs(deltaY)) {
		isSwiping.value = true;
	} else if (_touchedSticker) {
		setStickerStoreActiveItem(stickerStore, _touchedSticker, event.pointer);
	} else {
		return false;
	}
}

function pan(event: AppTouchInput) {
	if (isDragging.value) {
		isSwiping.value = false;
		return;
	}

	// In case the animation frame was retrieved after we stopped dragging.
	if (!isSwiping.value) {
		return;
	}

	_updateSliderOffset(event.deltaX);
}

function panEnd(event: AppTouchInput) {
	isSwiping.value = false;

	// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
	const { velocityX, deltaX, distance } = event;

	if (
		// Check if it was a fast flick,
		(Math.abs(velocityX) > 0.55 && distance > 10) ||
		// or if the pan distance was at least ~1/3 of the content area.
		Math.abs(deltaX) >= root.value!.clientWidth / 3
	) {
		if (velocityX > 0 || deltaX > 0) {
			goPrev();
		} else {
			goNext();
		}
		return;
	} else {
		Analytics.trackEvent('sticker-drawer', 'swipe-cancel');
	}

	_updateSliderOffset();
}

function _updateSliderOffset(extraOffsetPx = 0) {
	const pagePercent = sheetPage.value - 1;
	const pagePx = slider.value!.offsetWidth * -pagePercent;
	slider.value!.style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
}
// VueTouch things - END

async function calculateStickersPerRow() {
	await nextTick();

	if (!content.value) {
		return;
	}

	_stickersPerRow.value = Math.floor(
		(content.value.offsetWidth - _drawerPadding * 2) / effectiveStickerSize.value
	);
}

async function onIsLoadingChange() {
	await nextTick();

	if (!isLoading.value) {
		setStickerDrawerHeight(stickerStore, root.value!.offsetHeight);
		calculateStickersPerRow();
	}
}
</script>

<template>
	<div
		ref="root"
		class="sticker-drawer"
		:class="{ '-touch': !Screen.isPointerMouse }"
		:style="styleShell"
		@contextmenu.prevent
		@mousemove="onMouseMove"
		@mouseup="resetTouchedSticker()"
		@touchend="resetTouchedSticker()"
	>
		<div class="-margin" @click="onClickMargin()" />
		<div ref="content" class="-drawer-outer anim-fade-in-up" :style="styleOuter">
			<component
				:is="Screen.isPointerMouse ? AppScrollScroller : 'div'"
				:style="styleDimensions"
			>
				<AppLoadingFade :is-loading="isLoading">
					<component
						:is="drawerNavigationComponent"
						class="-scroller"
						v-bind="drawerNavigationProps"
						@panstart="panStart"
						@pan="pan"
						@panend="panEnd"
					>
						<div ref="slider" class="-drawer-inner">
							<template v-if="hasStickers">
								<div
									v-for="(sheet, index) in stickerSheets"
									:key="index"
									class="-sheet"
									:style="styleSheet"
								>
									<AppStickerLayerDrawerItem
										v-for="item of sheet"
										:key="item.sticker.id"
										:style="styleStickers"
										:sticker="item.sticker"
										:count="item.count"
										:size="stickerSize"
										@mousedown="assignTouchedSticker(item)"
										@touchstart="assignTouchedSticker(item)"
									/>
								</div>
							</template>
							<template v-else-if="hasLoaded">
								<div class="-no-stckers text-center">
									<p class="lead" style="padding: 0 16px">
										<AppTranslate>
											Oh no! Looks like you don't have any stickers.
										</AppTranslate>
									</p>
									<p>
										<AppTranslate>
											Use Game Jolt, like some posts, and you might get some.
										</AppTranslate>
									</p>
								</div>
							</template>
							<template v-else>
								<div />
							</template>
						</div>
					</component>
					<div v-if="!Screen.isPointerMouse">
						<AppEventItemMediaIndicator
							:count="stickerSheets.length"
							:current="sheetPage"
						/>
					</div>
				</AppLoadingFade>
			</component>
		</div>
		<div class="-margin" @click="onClickMargin()" />
	</div>
</template>

<style lang="stylus" scoped>
.-touch
	.-drawer-inner
		white-space: nowrap

	.-sheet
		display: inline-flex

.-loading
	margin: auto
	padding: 16px 0

.sticker-drawer
	position: fixed
	left: 0
	right: 0
	bottom: 0
	display: flex
	justify-content: center
	transition: transform 250ms $strong-ease-out

.-margin
	flex: auto

.-scroller
	height: 100%

.-drawer-outer
	elevate-2()
	change-bg('bg')
	margin: 0 auto
	height: 100%
	overflow: hidden

	@media $media-xs
		width: 100%

	@media $media-sm-up
		border-top-left-radius: $border-radius-large
		border-top-right-radius: $border-radius-large

.-drawer-inner
	transition: transform 300ms $strong-ease-out

.-sheet
	display: flex
	justify-content: center
	flex-wrap: wrap
</style>
