import Vue from 'vue';
import { Component, Emit, Inject, InjectReactive, Prop } from 'vue-property-decorator';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerOpen,
} from '../../../../_common/drawer/drawer-store';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import AppFiresideCohostManage from '../cohost/manage/manage.vue';
import AppFiresideHostThumb from '../_host-thumb/host-thumb.vue';
import AppFiresideStreamOptions from '../_stream-options/stream-options.vue';
import AppFiresideHostListStickerButton from './sticker-button/sticker-button.vue';

@Component({
	components: {
		AppFiresideHostThumb,
		AppScrollScroller,
		AppFiresideStreamOptions,
		AppFiresideCohostManage,
		AppFiresideHostListStickerButton,
	},
})
export default class AppFiresideHostList extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	hideThumbOptions!: boolean;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	canPlaceStickers = !GJ_IS_CLIENT;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get canManageCohosts() {
		return this.c.canManageCohosts;
	}

	onClickStickerButton() {
		setDrawerOpen(this.drawerStore, true);
	}
}
