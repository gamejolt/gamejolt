import { nextTick } from 'vue';
import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { sleep } from '../../../utils/utils';
import { shallowSetup } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import { assignDrawerStoreItem, PointerPosition, useDrawerStore } from '../../drawer/drawer-store';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/inview.vue';
import {
	getRectForStickerTarget,
	registerStickerTarget,
	StickerLayerController,
	StickerLayerKey,
	unregisterStickerTarget,
} from '../layer/layer-controller';
import { StickerPlacement } from '../placement/placement.model';
import AppStickerReactions from '../reactions/reactions.vue';
import AppSticker from '../sticker.vue';
import { getStickerModelResourceName, StickerTargetController } from './target-controller';

export type ValidStickerResource = 'Comment' | 'Fireside_Post' | 'MediaItem' | 'Fireside';

const InviewConfig = new ScrollInviewConfig();

@Options({
	components: {
		AppSticker,
		AppStickerReactions,
		AppScrollInview,
	},
})
export default class AppStickerTarget extends Vue {
	@Prop({ type: Object, required: true }) controller!: StickerTargetController;
	@Prop({ type: Boolean, default: false }) disabled!: boolean;

	drawerStore = shallowSetup(() => useDrawerStore());

	@Inject({ from: StickerLayerKey })
	layer!: StickerLayerController;

	declare $el: HTMLDivElement;
	readonly InviewConfig = InviewConfig;
	private queuedInview = false;

	get stickers() {
		// Sort so that the newer stickers go on top of the older ones.
		return [...this.controller.stickers].sort((a, b) => a.id - b.id);
	}

	get isShowingStickers() {
		return this.controller.shouldShow && this.controller.isInview && this.stickers.length > 0;
	}

	get shouldFade() {
		return this.drawerStore.isDrawerOpen.value;
	}

	created() {
		this.checkDisabledState();
	}

	beforeUnmount() {
		unregisterStickerTarget(this.layer, this, this.controller);
	}

	@Watch('disabled')
	checkDisabledState() {
		if (this.disabled) {
			unregisterStickerTarget(this.layer, this, this.controller);
		} else {
			registerStickerTarget(this.layer, this, this.controller);
		}
	}

	@Watch('controller.shouldLoad')
	async onShouldShowStickersChange() {
		if (this.controller.shouldLoad) {
			this.loadStickers();
		}
	}

	@Watch('isShowingStickers')
	async onIsShowingStickersChange() {
		await nextTick();

		if (this.isShowingStickers) {
			this.controller.newStickers = [];
		}
	}

	private async loadStickers() {
		this.controller.hasLoadedStickers = true;

		const resourceName = getStickerModelResourceName(this.controller.model);
		const resourceId = this.controller.model.id;

		const { stickers } = await Api.sendRequest(
			`/web/stickers/fetch/${resourceName}/${resourceId}`,
			undefined,
			{
				detach: true,
			}
		);

		this.controller.stickers = StickerPlacement.populate(stickers);
	}

	async onInview() {
		// We queue up the inview change to happen. If we haven't changed to
		// "out of view" within the wait, we then set ourselves as inview. This
		// helps to make sure we don't end up loading stickers when they're
		// scrolling super fast through the page.
		this.queuedInview = true;
		await sleep(500);

		if (this.queuedInview) {
			this.controller.isInview = true;
			this.queuedInview = false;
		}
	}

	onOutview() {
		this.queuedInview = false;
		this.controller.isInview = false;
	}

	onPlaceDrawerSticker(pointer: PointerPosition) {
		const { isDragging, sticker } = this.drawerStore;
		if (!isDragging.value || !sticker.value) {
			return;
		}

		const rect = getRectForStickerTarget(this.layer, this);
		if (!rect) {
			return;
		}

		// Sticker placement is in percentage of container
		const stickerPlacement = new StickerPlacement({
			position_x: (pointer.x - rect.x) / rect.width,
			position_y: (pointer.y - rect.y) / rect.height,
			rotation: Math.random(),
			sticker: sticker.value,
		});

		assignDrawerStoreItem(this.drawerStore, stickerPlacement, this.controller);
	}

	getStickerAnimationDelay(placement: StickerPlacement) {
		// Immediately show stickers if we're in a Live context.
		if (this.controller.isLive) {
			return 'unset';
		}

		// If the sticker was placed since we last rendered the stickers, we
		// don't want it to delay or it'll feel broken/slow. We wait a little
		// bit just because it looks a bit later after placing to wait.
		if (this.controller.newStickers.includes(placement)) {
			return '0.1s';
		}

		// This will make it take at most 500ms to load all the stickers in. We
		// do a max delay of 50ms so that it doesn't look frozen when there's
		// only a small amount of items.
		return Math.max(50, this.stickers.indexOf(placement) * (500 / this.stickers.length)) + 'ms';
	}
}
