import {
	computed,
	inject,
	InjectionKey,
	MaybeRef,
	MaybeRefOrGetter,
	provide,
	reactive,
	ref,
	Ref,
	shallowReadonly,
	ShallowRef,
	shallowRef,
	toRef,
	toValue,
	WritableComputedRef,
} from 'vue';
import { CommentModel } from '../../comment/comment-model';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { MediaItemModel } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { StickerLayerController } from '../layer/layer-controller';
import { StickerPlacementModel } from '../placement/placement.model';
import { ValidStickerResource } from './AppStickerTarget.vue';

const StickerTargetParentControllerKey: InjectionKey<MaybeRef<StickerTargetController>> =
	Symbol('sticker-target-parent');

type StickerTargetModel = FiresidePostModel | MediaItemModel;

export type StickerTargetController = {
	isInview: Ref<boolean>;
	hasLoadedStickers: Ref<boolean>;
	shouldLoad: Readonly<Ref<boolean>>;
	shouldShow: WritableComputedRef<boolean>;

	stickers: Ref<StickerPlacementModel[]>;
	newStickers: Ref<StickerPlacementModel[]>;

	layer: ShallowRef<StickerLayerController | null>;
	children: ShallowRef<StickerTargetController[]>;

	model: StickerTargetModel;
	parent: Readonly<Ref<StickerTargetController | null>>;
	isLive: boolean;

	canReceiveCharge: Readonly<Ref<boolean>>;
};

interface StickerTargetOptions {
	canReceiveCharge: MaybeRefOrGetter<boolean>;
	parent?: MaybeRefOrGetter<StickerTargetController | null>;
	isLive?: boolean;
}

export function createStickerTargetController(
	model: StickerTargetModel,
	{ isLive = false, ...restOptions }: StickerTargetOptions
) {
	model = reactive(model) as StickerTargetModel;
	const isInview = ref(false);
	const hasLoadedStickers = ref(false);

	const parent = toRef(() => toValue(restOptions.parent) || null);
	const canReceiveCharge = toRef(restOptions.canReceiveCharge);

	/**
	 * Note, the AppStickerTarget component is what actually loads the stickers
	 * in based on this state changing.
	 */
	const shouldLoad = computed(
		() => !isLive && shouldShow.value && isInview.value && !hasLoadedStickers.value
	);

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
					parent.value?.shouldShow.value ||
					layer.value?.isShowingDrawer.value
			);
		},
		set: value => {
			_shouldShow.value = value;
		},
	});

	const stickers = ref<StickerPlacementModel[]>([]);
	/** The stickers that have been added since the last time freshly rendered the target. */
	const newStickers = ref<StickerPlacementModel[]>([]);

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
		parent,
		isLive,
		canReceiveCharge,
	});

	parent.value?.children.value.push(c);

	return c;
}

export function provideStickerTargetController(controller: MaybeRef<StickerTargetController>) {
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
	if (model instanceof CommentModel) {
		return 'Comment';
	} else if (model instanceof MediaItemModel) {
		return 'MediaItem';
	} else if (model instanceof FiresidePostModel) {
		return 'Fireside_Post';
	}
	throw new Error('Stickers targets cannot attach to that type of model');
}

export function addStickerToTarget(
	controller: StickerTargetController,
	sticker: StickerPlacementModel
) {
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
	sticker: StickerPlacementModel
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
