import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerOpen,
} from '../../../../_common/drawer/drawer-store';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import AppFiresideCohostManage from '../cohost/manage/manage.vue';
import AppFiresideHostThumb from '../_host-thumb/host-thumb.vue';
import AppFiresideStreamOptions from '../_stream-options/stream-options.vue';
import AppFiresideStreamPlayback from '../_stream-playback/stream-playback.vue';
import AppFiresideHostListStickerButton from './sticker-button/sticker-button.vue';

@Options({
	components: {
		AppFiresideHostThumb,
		AppScrollScroller,
		AppFiresideStreamOptions,
		AppFiresideCohostManage,
		AppFiresideHostListStickerButton,
		AppFiresideStreamPlayback,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppFiresideHostList extends Vue {
	@Prop({ type: Boolean })
	hideThumbOptions!: boolean;

	@Prop({ type: Boolean })
	showPlayback!: boolean;

	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	@Inject({ from: DrawerStoreKey })
	drawerStore!: DrawerStore;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get canPlaceStickers() {
		return !!this.c.user && !Screen.isMobile;
	}

	get canManageCohosts() {
		return this.c.canManageCohosts;
	}

	onClickStickerButton() {
		setDrawerOpen(this.drawerStore, true);
	}
}
