import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
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

	get reactions() {
		return [...this.controller.model.sticker_counts].sort((a, b) =>
			numberSort(b.count, a.count)
		);
	}

	onClick() {
		toggleStickersShouldShow(this.controller);
	}
}
