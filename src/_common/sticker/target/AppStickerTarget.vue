<script lang="ts">
export type ValidStickerResource = 'Comment' | 'Fireside_Post' | 'MediaItem' | 'Fireside';
</script>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, PropType, ref, toRaw, toRefs, watch } from 'vue';
import { sleep } from '../../../utils/utils';
import { Api } from '../../api/api.service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/AppScrollInview.vue';
import AppSticker from '../AppSticker.vue';
import {
	getRectForStickerTarget,
	registerStickerTarget,
	unregisterStickerTarget,
	useStickerLayer,
} from '../layer/layer-controller';
import { StickerLayerItem } from '../layer/layer-item';
import { StickerPlacementModel } from '../placement/placement.model';
import {
	assignStickerStoreItem,
	closeStickerDrawer,
	PointerPosition,
	useStickerStore,
} from '../sticker-store';
import { getStickerModelResourceName, StickerTargetController } from './target-controller';

const InviewConfig = new ScrollInviewConfig();

const props = defineProps({
	controller: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
	disabled: {
		type: Boolean,
	},
});

const { controller, disabled } = toRefs(props);

const root = ref<HTMLDivElement>();

const stickerStore = useStickerStore();
const { isDragging, isDrawerOpen, sticker: storeSticker } = stickerStore;

const layer = useStickerLayer()!;

const layerItem = new StickerLayerItem(
	controller.value,
	() => root.value!.getBoundingClientRect(),
	pointer => onPlaceDrawerSticker(pointer)
);

let queuedInview = false;

const stickers = computed(() => {
	// Sort so that the newer stickers go on top of the older ones.
	return [...controller.value.stickers.value].sort((a, b) => a.id - b.id);
});

const isShowingStickers = computed(() => {
	return (
		controller.value.shouldShow.value &&
		controller.value.isInview.value &&
		stickers.value.length > 0
	);
});

const shouldFade = computed(() => isDrawerOpen.value);

watch(controller.value.shouldLoad, shouldLoad => {
	if (shouldLoad) {
		_loadStickers();
	}
});

watch(disabled, checkDisabledState);
watch(isShowingStickers, onIsShowingStickersChange);

checkDisabledState();

onBeforeUnmount(() => {
	unregisterStickerTarget(layer, layerItem);

	const wasAttemptingPlacement =
		toRaw(stickerStore.targetController.value) === toRaw(controller.value);
	const hasOtherLayers = (stickerStore.activeLayer.value?.layerItems.value.length || 0) > 0;

	// Close the sticker drawer if the placement (or drawer itself) has become
	// invalid.
	if (wasAttemptingPlacement || !hasOtherLayers) {
		closeStickerDrawer(stickerStore);
	}
});

function checkDisabledState() {
	if (disabled.value) {
		unregisterStickerTarget(layer, layerItem);
	} else {
		registerStickerTarget(layer, layerItem);
	}
}

async function onIsShowingStickersChange() {
	await nextTick();

	if (isShowingStickers.value) {
		controller.value.newStickers.value = [];
	}
}

async function _loadStickers() {
	controller.value.hasLoadedStickers.value = true;

	const {
		model,
		model: { id: resourceId },
	} = controller.value;

	const resourceName = getStickerModelResourceName(model);

	const { stickers } = await Api.sendRequest(
		`/web/stickers/fetch/${resourceName}/${resourceId}`,
		undefined,
		{
			detach: true,
		}
	);

	controller.value.stickers.value = StickerPlacementModel.populate(stickers);
}

async function onInview() {
	// We queue up the inview change to happen. If we haven't changed to
	// "out of view" within the wait, we then set ourselves as inview. This
	// helps to make sure we don't end up loading stickers when they're
	// scrolling super fast through the page.
	queuedInview = true;
	await sleep(500);

	if (queuedInview) {
		controller.value.isInview.value = true;
		queuedInview = false;
	}
}

function onOutview() {
	queuedInview = false;
	controller.value.isInview.value = false;
}

function onPlaceDrawerSticker(pointer: PointerPosition) {
	if (!isDragging.value || !storeSticker.value) {
		return;
	}

	const rect = getRectForStickerTarget(layer, layerItem);
	if (!rect) {
		return;
	}

	// Sticker placement is in percentage of container
	const stickerPlacement = new StickerPlacementModel({
		position_x: (pointer.x - rect.x) / rect.width,
		position_y: (pointer.y - rect.y) / rect.height,
		rotation: Math.random(),
		sticker: storeSticker.value,
		target_data: controller.value.targetData.value,
	});

	assignStickerStoreItem(stickerStore, stickerPlacement, controller.value);
}

function getStickerAnimationDelay(placement: StickerPlacementModel, index: number) {
	// Immediately show stickers if we're in a Live context.
	if (controller.value.isLive) {
		return 'unset';
	}

	// If the sticker was placed since we last rendered the stickers, we
	// don't want it to delay or it'll feel broken/slow. We wait a little
	// bit just because it looks a bit later after placing to wait.
	if (controller.value.newStickers.value.includes(placement)) {
		return '0.1s';
	}

	// This will make it take at most 500ms to load all the stickers in. We
	// do a max delay of 50ms so that it doesn't look frozen when there's
	// only a small amount of items.
	return Math.max(50, index * (500 / stickers.value.length)) + 'ms';
}
</script>

<template>
	<div ref="root" class="sticker-target">
		<AppScrollInview :config="InviewConfig" @inview="onInview" @outview="onOutview">
			<transition name="-fade">
				<div
					v-if="isShowingStickers"
					:class="{
						'-faded': shouldFade,
					}"
				>
					<template v-for="(sticker, index) of stickers" :key="sticker.id">
						<AppSticker
							class="-sticker -sticker-animate"
							:style="{ 'animation-delay': getStickerAnimationDelay(sticker, index) }"
							:sticker="sticker"
							:controller="controller"
							:is-clickable="!controller.isLive"
							:show-charged="sticker.is_charged"
						/>
					</template>
				</div>
			</transition>

			<slot />
		</AppScrollInview>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-target
	position: relative
	// Needs to be lower than the z-index of elements we want above the stickers.
	z-index: 0

.-sticker
	transition: filter 1s !important

	.-faded > &
		filter: grayscale(1) opacity(0.6)

.-sticker-animate
	animation-name: sticker-animate-in
	animation-duration: 0.5s
	animation-timing-function: $strong-ease-out
	animation-fill-mode: forwards
	opacity: 0

.-fade-leave-active
	transition: opacity 100ms

.-fade-leave-to
	opacity: 0

@keyframes sticker-animate-in
	0%
		transform: translateY(-16px)
		opacity: 0

	50%
		opacity: 1

	100%
		transform: translateY(0)
		opacity: 1
</style>
