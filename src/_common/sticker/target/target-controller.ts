import {
	computed,
	ComputedRef,
	inject,
	InjectionKey,
	provide,
	reactive,
	ref,
	Ref,
	shallowReadonly,
	ShallowRef,
	shallowRef,
	unref,
	WritableComputedRef,
} from 'vue';
import { MaybeComputedRef, MaybeRef } from '../../../utils/vue';
import { Comment } from '../../comment/comment-model';
import { Fireside } from '../../fireside/fireside.model';
import { FiresidePost } from '../../fireside/post/post-model';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { StickerLayerController } from '../layer/layer-controller';
import { StickerPlacement, StickerPlacementTargetData } from '../placement/placement.model';
import { CustomStickerPlacementRequest } from '../sticker-store';
import { ValidStickerResource } from './AppStickerTarget.vue';

const StickerTargetParentControllerKey: InjectionKey<MaybeRef<StickerTargetController>> =
	Symbol('sticker-target-parent');

type StickerTargetModel = FiresidePost | Comment | MediaItem | Fireside;

export type StickerTargetController = {
	isInview: Ref<boolean>;
	hasLoadedStickers: Ref<boolean>;
	shouldLoad: ComputedRef<boolean>;
	shouldShow: WritableComputedRef<boolean>;

	stickers: Ref<StickerPlacement[]>;
	newStickers: Ref<StickerPlacement[]>;

	layer: ShallowRef<StickerLayerController | null>;
	children: ShallowRef<StickerTargetController[]>;

	model: StickerTargetModel;
	parent: ComputedRef<StickerTargetController | null>;
	isLive: boolean;

	placeStickerCallback?: CustomStickerPlacementRequest;
	targetData: ComputedRef<StickerPlacementTargetData | undefined>;
	isCreator: ComputedRef<boolean>;
};

interface StickerTargetOptions {
	isCreator: MaybeComputedRef<boolean>;
	parent?: MaybeRef<StickerTargetController | null>;
	isLive?: boolean;
	placeStickerCallback?: CustomStickerPlacementRequest;
	targetData?: MaybeComputedRef<StickerPlacementTargetData>;
}

export function createStickerTargetController(
	model: StickerTargetModel,
	{ isCreator, parent, isLive = false, placeStickerCallback, targetData }: StickerTargetOptions
) {
	model = reactive(model) as StickerTargetModel;
	const isInview = ref(false);
	const hasLoadedStickers = ref(false);

	const refParent = computed(() => unref(parent) || null);

	/**
	 * Note, the AppStickerTarget component is what actually loads the stickers
	 * in based on this state changing.
	 */
	const shouldLoad = computed(() => {
		return !isLive && shouldShow.value && isInview.value && !hasLoadedStickers.value;
	});

	const _shouldShow = ref(false);
	const shouldShow = computed({
		get: () => {
			// Stickers in a Live context will show, fade, then remove themselves
			// automatically. Always show Live stickers.
			if (isLive) {
				return true;
			}

			return Boolean(
				_shouldShow.value ||
					refParent.value?.shouldShow.value ||
					layer.value?.isShowingDrawer.value
			);
		},
		set: value => {
			_shouldShow.value = value;
		},
	});

	const stickers = ref<StickerPlacement[]>([]);
	/** The stickers that have been added since the last time freshly rendered the target. */
	const newStickers = ref<StickerPlacement[]>([]);

	/**
	 * This is the layer that this target lives within. It gets set when the
	 * AppStickerTarget registers the target to the layer.
	 */
	const layer = shallowRef<StickerLayerController | null>(null);
	const children = shallowRef<StickerTargetController[]>([]);

	const c: StickerTargetController = shallowReadonly({
		isInview,
		hasLoadedStickers,
		shouldShow,
		stickers,
		newStickers,
		layer,
		children,
		shouldLoad,
		model,
		parent: refParent,
		isLive,
		placeStickerCallback,
		targetData: computed(() => unref(targetData)),
		isCreator: computed(() => unref(isCreator)),
	});

	if (refParent.value) {
		refParent.value.children.value.push(c);
	}

	return c;
}

export function provideStickerTargetController(
	controller?: MaybeRef<StickerTargetController | null>
) {
	provide(StickerTargetParentControllerKey, controller);
}

export function useStickerTargetController() {
	return inject(StickerTargetParentControllerKey) || null;
}

export function toggleStickersShouldShow(
	controller: StickerTargetController,
	/** Whether or not to force reload the stickers for this target. */
	forceLoad = false,
	shouldShow?: boolean
) {
	// The parent is the one that gets the state for should showing. All
	// children follow along within the getter.
	if (controller.parent.value) {
		toggleStickersShouldShow(controller.parent.value, forceLoad, shouldShow);
		return;
	}

	shouldShow = shouldShow ?? !controller.shouldShow.value;
	controller.shouldShow.value = shouldShow;

	if (forceLoad) {
		controller.hasLoadedStickers.value = false;
	}
}

export function getStickerModelResourceName(model: Model): ValidStickerResource {
	if (model instanceof Comment) {
		return 'Comment';
	} else if (model instanceof MediaItem) {
		return 'MediaItem';
	} else if (model instanceof FiresidePost) {
		return 'Fireside_Post';
	} else if (model instanceof Fireside) {
		return 'Fireside';
	}
	throw new Error('Stickers targets cannot attach to that type of model');
}

export function addStickerToTarget(controller: StickerTargetController, sticker: StickerPlacement) {
	const { stickers, newStickers, isLive } = controller;

	stickers.value.push(sticker);
	newStickers.value.push(sticker);

	// Anytime we add new stickers to a non-Live target, show all the stickers again.
	if (!isLive) {
		toggleStickersShouldShow(controller, false, true);
	}
}

/**
 * Use by stickers in a Live context to remove themselves after their animations finish.
 */
export function removeStickerFromTarget(
	controller: StickerTargetController,
	sticker: StickerPlacement
) {
	const { stickers, newStickers } = controller;

	let index = stickers.value.indexOf(sticker);
	if (index !== -1) {
		stickers.value.splice(index, 1);
	}
	index = newStickers.value.indexOf(sticker);
	if (index !== -1) {
		newStickers.value.splice(index, 1);
	}
}
