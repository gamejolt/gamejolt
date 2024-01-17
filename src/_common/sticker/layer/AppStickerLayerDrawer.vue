<script lang="ts" setup>
import {
	computed,
	CSSProperties,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	toRef,
	watch,
} from 'vue';
import {
	styleBorderRadiusLg,
	styleCaret,
	styleChangeBg,
	styleElevate,
	styleTextOverflow,
	styleWhen,
} from '../../../_styles/mixins';
import { kBorderRadiusLg, kStrongEaseOut } from '../../../_styles/variables';
import { showVendingMachineModal } from '../../../app/components/vending-machine/modal/modal.service';
import { Analytics } from '../../analytics/analytics.service';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppButton from '../../button/AppButton.vue';
import { EscapeStack, EscapeStackCallback } from '../../escape-stack/escape-stack.service';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import { vAppObserveDimensions } from '../../observe-dimensions/observe-dimensions.directive';
import AppPageIndicatorCompact from '../../pagination/AppPageIndicatorCompact.vue';
import { Ruler } from '../../ruler/ruler-service';
import { onScreenResize, Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import { kThemePrimary, kThemePrimaryFg } from '../../theme/variables';
import AppTouch, { AppTouchInput } from '../../touch/AppTouch.vue';
import {
	closeStickerDrawer,
	commitStickerStoreItemPlacement,
	setStickerDrawerHeight,
	setStickerStoreActiveItem,
	useStickerStore,
} from '../sticker-store';
import { StickerModel, StickerStack } from '../sticker.model';
import AppStickerLayerDrawerItem from './AppStickerLayerDrawerItem.vue';

const stickerStore = useStickerStore();
const {
	sticker: storeSticker,
	allStickers: items,
	isHoveringDrawer,
	isDrawerOpen,
	isDragging,
	isLoading,
	hasLoaded,
	placedItem,
	canPlaceChargedStickerOnResource,
	isChargingSticker,
	drawerStickerSize,
	drawerPadding,
	drawerStickerSpacing,
	drawerNumRows,
	drawerCollapsedHeight,
} = stickerStore;

let _touchedSticker: StickerModel | null = null;
let _escapeCallback: EscapeStackCallback | null = null;

const sheetPage = ref(1);
const isSwipingSheets = ref(false);
const _stickersPerRow = ref(5);

const overflowTopBarText = ref(true);
const isConfirmingPlacement = ref(false);

const root = ref<HTMLDivElement>();
const content = ref<HTMLDivElement>();
const slider = ref<HTMLDivElement>();

const showPlaceButton = toRef(() => !!placedItem.value);
const hasStickers = toRef(() => !!items.value.length);
const topBarMargin = toRef(() => (Screen.isXs ? `0px` : `4px`));
const creatorSize = computed(() => Math.max(drawerStickerSize.value * 0.25, 16));
const drawerMaxHeight = computed(
	() =>
		`${
			drawerPadding.value * 2 +
			drawerStickerSize.value * drawerNumRows.value +
			drawerStickerSpacing.value * (Math.floor(drawerNumRows.value) - 1)
		}px`
);
const stickerSheets = computed(() => {
	const maxPerSheet = maxStickersPerSheet.value;
	if (maxPerSheet === null) {
		return [items.value.filter(i => typeof i.count === 'number')];
	}

	const sheets = [];
	let currentSheet: StickerStack[] = [];
	for (const i of items.value) {
		if (typeof i.count !== 'number') {
			continue;
		}
		currentSheet.push(i);

		if (currentSheet.length >= maxPerSheet) {
			sheets.push(currentSheet);
			currentSheet = [];
		}
	}
	if (currentSheet.length > 0) {
		sheets.push(currentSheet);
	}
	return sheets;
});
const maxStickersPerSheet = computed(() => {
	if (Screen.isPointerMouse) {
		return null;
	}
	return _stickersPerRow.value * 2;
});

const styleOuter = computed(() => {
	return {
		...styleElevate(2),
		...styleChangeBg('bg'),
		cursor: isDragging.value ? 'grabbing' : 'default',
		paddingTop: drawerPadding.px,
		margin: `0 auto`,
		height: `100%`,
		overflow: `hidden`,
		// Max-width is unset when Xs (so it can bleed and span the whole
		// width), with margins of 64px on other breakpoints.
		maxWidth: Screen.isXs ? 'unset' : `calc(100% - 64px)`,
		...styleWhen(Screen.isPointerMouse, {
			// Max-height of 2 sticker rows
			maxHeight: drawerMaxHeight.value,
		}),
		...styleWhen(Screen.isXs, {
			width: `100%`,
		}),
		...styleWhen(!Screen.isXs, {
			borderTopLeftRadius: kBorderRadiusLg.px,
			borderTopRightRadius: kBorderRadiusLg.px,
		}),
	} satisfies CSSProperties;
});

useEventSubscription(onScreenResize, calculateStickersPerRow);

watch(
	isLoading,
	async isLoading => {
		await nextTick();

		if (!isLoading) {
			onContentDimensionsChanged();
			calculateStickersPerRow();
		}
	},
	{ immediate: true }
);

function closeDrawer() {
	closeStickerDrawer(stickerStore);
}

onMounted(() => {
	calculateStickersPerRow();

	_escapeCallback = () => closeDrawer();
	EscapeStack.register(_escapeCallback);
});

onBeforeUnmount(() => {
	if (_escapeCallback) {
		EscapeStack.deregister(_escapeCallback);
		_escapeCallback = null;
	}
});

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

async function calculateStickersPerRow() {
	await nextTick();

	if (!content.value) {
		return;
	}

	const horizontalSpace = content.value.offsetWidth - drawerPadding.value * 2;
	const roughPerRow = Math.floor(horizontalSpace / drawerStickerSize.value);

	_stickersPerRow.value = Math.floor(
		(horizontalSpace - drawerStickerSpacing.value * (roughPerRow - 1)) / drawerStickerSize.value
	);
}

function onContentDimensionsChanged() {
	if (showPlaceButton.value || !content.value) {
		return;
	}
	setStickerDrawerHeight(stickerStore, Ruler.height(content.value));
}

function onClickPurchasePacks() {
	closeStickerDrawer(stickerStore);
	showVendingMachineModal({ location: 'sticker-drawer' });
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

function assignTouchedSticker(stickerStack: StickerStack | null) {
	if (!stickerStack) {
		_touchedSticker = null;
		return;
	} else if (!isDrawerOpen.value || storeSticker.value || !stickerStack.count) {
		return;
	}
	_touchedSticker = stickerStack.sticker;
}

function onMouseMove(event: MouseEvent) {
	if (!_touchedSticker) {
		return;
	}
	setStickerStoreActiveItem(stickerStore, _touchedSticker, event);
	assignTouchedSticker(null);
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

function panMove(event: AppTouchInput) {
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
</script>

<template>
	<div
		ref="root"
		:style="{
			position: `fixed`,
			left: Screen.isXs ? 0 : `64px`,
			right: 0,
			bottom: 0,
			display: `flex`,
			justifyContent: `center`,
			transition: `transform 250ms ${kStrongEaseOut}`,
			transform: `translateY(0)`,
			...styleWhen(Screen.isPointerMouse, {
				// Max-height of 2 sticker rows
				maxHeight: drawerMaxHeight,
			}),
			...styleWhen(storeSticker && !isHoveringDrawer && !placedItem, {
				// Shift the drawer down when there's an item being dragged
				// and the drawer container is not being hovered.
				transform: `translateY(calc(100% - ${drawerCollapsedHeight.px}))`,
			}),
		}"
		@contextmenu.prevent
		@mousemove="onMouseMove"
		@mouseup="assignTouchedSticker(null)"
		@touchend="assignTouchedSticker(null)"
	>
		<div :style="{ flex: `auto` }" @click="closeDrawer()" />

		<template v-if="showPlaceButton">
			<div
				:style="{
					...styleOuter,
					flex: `1 1 100vw`,
					overflow: `visible`,
					display: `flex`,
					gap: `12px`,
					padding: `12px`,
					position: `relative`,
					...styleWhen(!Screen.isXs, {
						flex: 3,
						maxWidth: `calc(min(100% - 64px, 500px))`,
					}),
				}"
			>
				<div
					v-if="canPlaceChargedStickerOnResource && !isChargingSticker"
					:style="{
						...styleChangeBg('primary'),
						color: kThemePrimaryFg,
						display: `inline-flex`,
						padding: `8px 12px 8px`,
						gap: `12px`,
						position: `absolute`,
						bottom: `calc(100% + ${topBarMargin})`,
						zIndex: -1,
						left: 0,
						maxWidth: `100%`,
						...styleWhen(Screen.isXs, {
							right: 0,
						}),
						...styleWhen(!Screen.isXs, styleBorderRadiusLg),
					}"
					@click="overflowTopBarText = !overflowTopBarText"
				>
					<div
						:style="{
							minWidth: 0,
							maxWidth: `100%`,
							...styleWhen(overflowTopBarText, {
								...styleTextOverflow,
							}),
						}"
					>
						{{ $gettext(`Support your favorite creators with charged stickers!`) }}
					</div>
				</div>

				<AppAnimElectricity
					v-if="!isChargingSticker && canPlaceChargedStickerOnResource"
					shock-anim="square"
					:disabled="!canPlaceChargedStickerOnResource"
					:style="{ position: `relative` }"
				>
					<AppButton
						sparse
						icon="bolt-unfilled"
						primary
						:solid="canPlaceChargedStickerOnResource"
						@click="isChargingSticker = true"
					/>

					<div
						:style="{
							...styleCaret(kThemePrimary, 'down', '7px'),
							bottom: `calc(100% + 2px + ${drawerPadding.px})`,
						}"
					/>
				</AppAnimElectricity>

				<AppAnimElectricity
					shock-anim="wide-rect"
					:disabled="!isChargingSticker"
					:style="{
						width: '100%',
					}"
				>
					<AppButton block primary :solid="isChargingSticker" @click="onClickPlace()">
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
			class="anim-fade-in-up"
			:style="{
				...styleOuter,
				...styleWhen(showPlaceButton, {
					display: `none`,
				}),
			}"
		>
			<AppLoadingFade :is-loading="isLoading">
				<component
					:is="Screen.isPointerMouse ? AppScrollScroller : 'div'"
					:style="{
						minWidth: Screen.isXs ? 'unset' : '400px',
						minHeight: `${drawerStickerSize}px`,
						paddingBottom: drawerPadding.px,
						...styleWhen(Screen.isPointerMouse, {
							// Max-height of 2 sticker rows
							maxHeight: drawerMaxHeight,
						}),
					}"
				>
					<AppLoadingFade :is-loading="isLoading">
						<component
							:is="Screen.isPointerMouse ? 'div' : AppTouch"
							:style="{
								height: `100%`,
							}"
							v-bind="
								Screen.isPointerMouse
									? {}
									: {
											'pan-options': { threshold: 16 },
									  }
							"
							@panstart="panStart"
							@panmove="panMove"
							@panend="panEnd"
						>
							<div
								ref="slider"
								:style="{
									transition: `transform 300ms ${kStrongEaseOut}`,
									...styleWhen(!Screen.isPointerMouse, {
										whiteSpace: `nowrap`,
										display: `flex`,
										flexWrap: `nowrap`,
									}),
								}"
							>
								<template v-if="hasStickers">
									<div
										v-for="(sheet, index) in stickerSheets"
										:key="index"
										:style="{
											padding: `0 ${drawerPadding.px}`,
											width: `100%`,
											height: `100%`,
											display: `flex`,
											gap: `${drawerStickerSpacing}px`,
											justifyContent: `space-between`,
											flexWrap: `wrap`,
											...styleWhen(!Screen.isPointerMouse, {
												display: `inline-flex`,
												flex: `none`,
											}),
										}"
									>
										<div v-for="item of sheet" :key="item.sticker.id">
											<AppStickerLayerDrawerItem
												:sticker="item.sticker"
												:count="item.count || undefined"
												:size="drawerStickerSize"
												show-mastery
												show-creator
												:creator-size="creatorSize"
												@mousedown="assignTouchedSticker(item)"
												@touchstart="assignTouchedSticker(item)"
											/>
										</div>
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
						<div v-if="!Screen.isPointerMouse" :style="{ marginTop: `8px` }">
							<AppPageIndicatorCompact
								:count="stickerSheets.length"
								:current="sheetPage"
							/>
						</div>
					</AppLoadingFade>
				</component>
			</AppLoadingFade>
		</div>

		<div :style="{ flex: `auto` }" @click="closeDrawer()" />
	</div>
</template>
