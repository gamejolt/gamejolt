<script lang="ts" setup>
import { computed, CSSProperties, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { showVendingMachineModal } from '../../../app/components/vending-machine/modal/modal.service';
import { Analytics } from '../../analytics/analytics.service';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppButton from '../../button/AppButton.vue';
import { EscapeStack, EscapeStackCallback } from '../../escape-stack/escape-stack.service';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import { vAppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import AppPageIndicator from '../../pagination/AppPageIndicator.vue';
import { Ruler } from '../../ruler/ruler-service';
import { onScreenResize, Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import AppTouch, { AppTouchInput } from '../../touch/AppTouch.vue';
import {
	closeStickerDrawer,
	commitStickerStoreItemPlacement,
	setStickerStoreActiveItem,
	useStickerStore,
} from '../sticker-store';
import { Sticker, StickerStack } from '../sticker.model';
import AppStickerLayerDrawerItem from './AppStickerLayerDrawerItem.vue';

const stickerStore = useStickerStore();
const {
	sticker: storeSticker,
	allStickers: items,
	stickerSize,
	drawerHeight,
	isHoveringDrawer,
	isDrawerOpen,
	isDragging,
	isLoading,
	hasLoaded,
	placedItem,
	canPlaceChargedStickerOnResource,
	isChargingSticker,
} = stickerStore;

const _drawerPadding = 8;
const _stickerSpacing = 8;

let _touchedSticker: Sticker | null = null;
let _escapeCallback: EscapeStackCallback | null = null;

const sheetPage = ref(1);
const isSwipingSheets = ref(false);
const _stickersPerRow = ref(5);

const overflowTopBarText = ref(true);
const isConfirmingPlacement = ref(false);

const root = ref<HTMLDivElement>();
const content = ref<HTMLDivElement>();
const slider = ref<HTMLDivElement>();

const showPlaceButton = computed(() => !!placedItem.value);

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
	if (storeSticker.value && !isHoveringDrawer.value && !placedItem.value) {
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

	_escapeCallback = () => closeStickerDrawer(stickerStore);
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
		if (typeof i.count !== 'number') {
			continue;
		}
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

async function onClickPlace() {
	// Only allow 1 placement request through at a time for each sticker
	// ghost. This component will be v-if'd away after placement if it
	// doesn't fail.
	if (isConfirmingPlacement.value) {
		return;
	}
	isConfirmingPlacement.value = true;
	Analytics.trackEvent('sticker-drawer', 'confirm-placement');
	await commitStickerStoreItemPlacement(stickerStore);
	isConfirmingPlacement.value = false;
}

function onClickMargin() {
	closeStickerDrawer(stickerStore);
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
	if (!isDrawerOpen.value || storeSticker.value || !sticker.count) {
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
		isSwipingSheets.value = true;
	} else if (_touchedSticker) {
		setStickerStoreActiveItem(stickerStore, _touchedSticker, event.pointer);
	} else {
		return false;
	}
}

function pan(event: AppTouchInput) {
	if (isDragging.value) {
		isSwipingSheets.value = false;
		return;
	}

	// In case the animation frame was retrieved after we stopped dragging.
	if (!isSwipingSheets.value) {
		return;
	}

	_updateSliderOffset(event.deltaX);
}

function panEnd(event: AppTouchInput) {
	if (!isSwipingSheets.value) {
		return;
	}
	isSwipingSheets.value = false;

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
		onContentDimensionsChanged();
		calculateStickersPerRow();
	}
}

function onContentDimensionsChanged() {
	if (showPlaceButton.value || !content.value) {
		return;
	}

	drawerHeight.value = Ruler.height(content.value);
}

function onClickPurchasePacks() {
	closeStickerDrawer(stickerStore);
	showVendingMachineModal();
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

		<template v-if="showPlaceButton">
			<div class="-drawer-outer -drawer-outer-place" :style="styleOuter">
				<div
					v-if="canPlaceChargedStickerOnResource && !isChargingSticker"
					class="-top-bar"
					:class="{
						'-text-overflow': overflowTopBarText,
					}"
					@click="overflowTopBarText = !overflowTopBarText"
				>
					<div class="-top-bar-text">
						{{ $gettext(`Support your favorite creators with charged stickers!`) }}
					</div>
				</div>

				<AppAnimElectricity
					v-if="!isChargingSticker && canPlaceChargedStickerOnResource"
					shock-anim="square"
					:disabled="!canPlaceChargedStickerOnResource"
				>
					<AppButton
						class="-charge-caret"
						sparse
						icon="bolt-unfilled"
						primary
						:solid="canPlaceChargedStickerOnResource"
						@click="isChargingSticker = true"
					/>
				</AppAnimElectricity>

				<AppAnimElectricity
					shock-anim="wide-rect"
					:disabled="!isChargingSticker"
					:style="{
						width: '100%',
					}"
				>
					<AppButton
						block
						primary
						:solid="isChargingSticker"
						:disabled="isConfirmingPlacement"
						:loading="isConfirmingPlacement"
						@click="onClickPlace()"
					>
						<span v-if="isChargingSticker">
							{{ $gettext(`Place charged sticker`) }}
						</span>
						<span v-else>
							{{ $gettext(`Place sticker`) }}
						</span>
					</AppButton>
				</AppAnimElectricity>
			</div>
		</template>

		<div
			ref="content"
			v-app-observe-dimensions="onContentDimensionsChanged"
			class="-drawer-outer anim-fade-in-up"
			:style="{ ...styleOuter, display: !showPlaceButton ? undefined : 'none' }"
		>
			<AppLoadingFade :is-loading="isLoading">
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
											:count="item.count || undefined"
											:size="stickerSize"
											show-creator
											@mousedown="assignTouchedSticker(item)"
											@touchstart="assignTouchedSticker(item)"
										/>
									</div>
								</template>
								<template v-else-if="hasLoaded">
									<div class="text-center">
										<p class="lead" :style="{ padding: `0 16px` }">
											{{
												$gettext(
													`Oh no! Looks like you don't have any stickers.`
												)
											}}
										</p>

										<div
											:style="{
												padding: `0 16px`,
												marginBottom: `8px`,
											}"
										>
											<AppButton block solid @click="onClickPurchasePacks()">
												{{ $gettext(`Purchase packs`) }}
											</AppButton>
										</div>
									</div>
								</template>
								<template v-else>
									<div />
								</template>
							</div>
						</component>
						<div v-if="!Screen.isPointerMouse">
							<AppPageIndicator :count="stickerSheets.length" :current="sheetPage" />
						</div>
					</AppLoadingFade>
				</component>
			</AppLoadingFade>
		</div>

		<div class="-margin" @click="onClickMargin()" />
	</div>
</template>

<style lang="stylus" scoped>
.sticker-drawer
	position: fixed
	left: 0
	right: 0
	bottom: 0
	display: flex
	justify-content: center
	transition: transform 250ms $strong-ease-out
	--top-bar-margin: 4px

	@media $media-xs
		--top-bar-margin: 0px

.-touch
	.-drawer-inner
		white-space: nowrap
		display: flex
		flex-wrap: nowrap

	.-sheet
		display: inline-flex
		flex: none

.-loading
	margin: auto
	padding: 16px 0

.-margin
	flex: auto

.-scroller
	height: 100%

.-text-overflow
	&
	> *
		text-overflow()

.-top-bar-text
	min-width: 0
	max-width: 100%

.-drawer-outer
	elevate-2()
	change-bg('bg')
	margin: 0 auto
	height: 100%
	overflow: hidden

	@media $media-xs
		width: 100%

.-drawer-outer-place
	flex: 1 1 100vw
	overflow: visible
	display: flex
	gap: 12px
	padding: 12px
	position: relative

@media $media-sm-up
	.-top-bar
		rounded-corners-lg()

	.-drawer-outer
		border-top-left-radius: $border-radius-large
		border-top-right-radius: $border-radius-large

	.-drawer-outer-place
		flex: 3
		max-width: calc(min(100% - 64px, 500px)) !important

.-top-bar
	display: inline-flex
	padding: 8px 12px 8px
	gap: 12px
	position: absolute
	bottom: calc(100% + var(--top-bar-margin))
	z-index: -1
	left: 0
	change-bg('primary')
	theme-prop('color', 'primary-fg')
	max-width: 100%

	@media $media-xs
		right: 0

.-drawer-inner
	transition: transform 300ms $strong-ease-out

.-sheet
	display: flex
	justify-content: center
	flex-wrap: wrap

.-place-button-container
	display: flex
	gap: 12px

.-charge-caret::before
	content: ''
	position: absolute
	bottom: calc(100% + 2px + var(--top-bar-margin)) !important
	caret(color: var(--theme-primary), direction: 'down', size: 7px)
</style>
