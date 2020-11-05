import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { DrawerStore, DrawerStoreKey } from '../../drawer/drawer-store';
import { Sticker } from '../sticker.model';

@Component({})
export default class AppStickerLayerDrawerItem extends Vue {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(Number, 0)) count!: number;
	@Prop(propOptional(Number, 64)) size!: number;
	@Prop(propOptional(Boolean, false)) hideCount!: boolean;

	$el!: HTMLDivElement;

	get itemStyling() {
		return {
			height: this.size + 'px',
			width: this.size + 'px',
			cursor: this.drawerStore.isDragging ? 'grabbing' : 'grab',
		};
	}

	get isPeeled() {
		return this.drawerStore.sticker?.id === this.sticker.id || this.count < 1;
	}
}
