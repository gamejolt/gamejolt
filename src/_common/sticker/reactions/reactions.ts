import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { numberSort } from '../../../utils/array';
import { propRequired } from '../../../utils/vue';
import { DrawerStore, DrawerStoreKey } from '../../drawer/drawer-store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { StickerTargetController, toggleStickersShouldShow } from '../target/target-controller';
import AppStickerReactionsItem from './item.vue';

@Component({
	components: {
		AppStickerReactionsItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppStickerReactions extends Vue {
	@Prop(propRequired(StickerTargetController)) controller!: StickerTargetController;

	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@Emit('show') emitShow() {}

	get reactions() {
		return [...this.controller.model.sticker_counts].sort((a, b) =>
			numberSort(b.count, a.count)
		);
	}

	onClick() {
		// Stickers in a Live context will automatically remove themselves - do nothing.
		if (this.controller.isLive) {
			return;
		}

		toggleStickersShouldShow(this.controller, true);

		if (this.controller.shouldShow) {
			this.emitShow();
		}
	}
}
