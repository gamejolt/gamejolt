import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { getAbsoluteLink } from '../../../../../utils/router';
import AppCommunityJoinWidget from '../../../../../_common/community/join-widget/join-widget.vue';
import AppCommunityVerifiedTick from '../../../../../_common/community/verified-tick/verified-tick.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../../_common/share/share.service';
import { SidebarState, SidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTheme } from '../../../../../_common/theme/theme';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { CommunitySidebarModal } from '../../../../components/community/sidebar/modal/modal.service';
import { Store } from '../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppEditableThumbnail from '../_editable-thumbnail/editable-thumbnail.vue';

@Options({
	components: {
		AppPopper,
		AppTheme,
		AppCommunityVerifiedTick,
		AppEditableThumbnail,
		AppCommunityJoinWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppMobileHeader extends Vue {
	@Prop({ type: Boolean, default: false }) hasUnread!: boolean;

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	@AppState user!: AppStore['user'];
	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel;
	}

	get memberCount() {
		return this.community.member_count || 0;
	}

	get shouldShowModTools() {
		return this.user?.isMod === true;
	}

	get isFeaturedChannel() {
		return this.routeStore.channelPath === 'featured';
	}

	get shouldShowChannelsMenu() {
		return !!this.activeContextPane;
	}

	get isJam() {
		return this.channel?.type === 'competition';
	}

	get shouldShowAbout() {
		// It's too confusing to see an "About" button for the community as well
		// as the jam info.
		if (this.isJam) {
			return false;
		}

		if (this.routeStore.sidebarData) {
			return Screen.isMobile;
		}

		return false;
	}

	onClickMenu() {
		this.toggleLeftPane('context');
	}

	onClickAbout() {
		const { sidebarData, community } = this.routeStore;

		if (sidebarData) {
			CommunitySidebarModal.show({
				isEditing: false,
				sidebarData,
				community,
			});
		}
	}

	onClickExtrasOption() {
		Popper.hideAll();
	}

	copyShareUrl() {
		const url = getAbsoluteLink(this.$router, this.community.routeLocation);
		copyShareLink(url, 'community');

		Popper.hideAll();
	}
}
