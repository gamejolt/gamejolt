import { defineAsyncComponent } from '@vue/runtime-core';
import { ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Provide, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import {
	ContentFocus,
	registerContentFocusWatcher,
} from '../../content-focus/content-focus.service';
import {
	registerStickerLayer,
	unregisterStickerLayer,
	useDrawerStore,
} from '../../drawer/drawer-store';
import { useScroller } from '../../scroll/scroller/scroller.vue';
import { StickerLayerController, StickerLayerKey } from './layer-controller';

@Options({
	components: {
		// Lazy load all of this since we only need it when the drawer is showing.
		AppStickerLayerPlacementMask: defineAsyncComponent(() => import('./placement-mask.vue')),
	},
})
export default class AppStickerLayer extends Vue {
	@Prop({ type: Boolean, default: false }) hasFixedParent!: boolean;

	drawer = shallowSetup(() => useDrawerStore());

	@Provide({ to: StickerLayerKey, reactive: true })
	layer!: StickerLayerController;

	scroller = setup(() => ref(useScroller()));

	private focusWatcherDeregister!: () => void;

	get isDragging() {
		return this.drawer.isDragging.value;
	}

	get isShowingDrawer() {
		return this.layer.isShowingDrawer;
	}

	created() {
		this.layer = new StickerLayerController(this.drawer);
		registerStickerLayer(this.drawer, this.layer);
	}

	mounted() {
		this.layer.scroller = this.scroller ?? null;

		// We tell the ContentFocus service that content is unfocused when the
		// mask is active.
		this.focusWatcherDeregister = registerContentFocusWatcher(
			ContentFocus,
			() => !this.isShowingDrawer
		);
	}

	beforeUnmount() {
		unregisterStickerLayer(this.drawer, this.layer);
		this.focusWatcherDeregister();
	}

	onContextMenu(e: MouseEvent) {
		if (!this.isShowingDrawer) {
			return;
		}
		e.preventDefault();
	}
}
