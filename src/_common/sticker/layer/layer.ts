import { defineAsyncComponent } from '@vue/runtime-core';
import { ref } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Provide, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import {
	ContentFocus,
	registerContentFocusWatcher,
} from '../../content-focus/content-focus.service';
import {
	DrawerStore,
	DrawerStoreKey,
	registerStickerLayer,
	unregisterStickerLayer,
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
	@Prop(propOptional(Boolean, false)) hasFixedParent!: boolean;

	@Inject({ from: DrawerStoreKey })
	drawer!: DrawerStore;

	@Provide({ to: StickerLayerKey, reactive: true })
	layer!: StickerLayerController;

	scroller = setup(() => ref(useScroller()));

	private focusWatcherDeregister!: () => void;

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
			() => !this.layer.isShowingDrawer
		);
	}

	beforeUnmount() {
		unregisterStickerLayer(this.drawer, this.layer);
		this.focusWatcherDeregister();
	}

	onContextMenu(e: MouseEvent) {
		if (!this.layer.isShowingDrawer) {
			return;
		}
		e.preventDefault();
	}
}
