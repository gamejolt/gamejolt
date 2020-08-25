import { Component, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { CommunitySidebarModal } from '../../../app/components/community/sidebar/modal/modal.service';
import { Store } from '../../../app/store/index';
import { CommunityRouteStore } from '../../../app/views/communities/view/view.store';
import { propOptional } from '../../../utils/vue';
import { Clipboard } from '../../clipboard/clipboard-service';
import { Environment } from '../../environment/environment.service';
import { Popper } from '../../popper/popper.service';
import AppPopper from '../../popper/popper.vue';
import { Screen } from '../../screen/screen-service';
import { SidebarState, SidebarStore } from '../../sidebar/sidebar.store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppCommunityCardBase from './card-base';

@Component({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityCardBaseInline extends AppCommunityCardBase {
	@Prop(propOptional(CommunityRouteStore, null)) routeStore!: CommunityRouteStore | null;
	@Prop(propOptional(Boolean, false)) asHeader!: boolean;

	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	readonly Screen = Screen;

	get hasCorrectRouteData() {
		return !!this.routeStore && this.routeStore.community.id === this.community.id;
	}

	get isFeaturedChannel() {
		if (!this.hasCorrectRouteData) {
			return false;
		}

		return this.routeStore!.channelPath === 'featured';
	}

	get shouldShowChannelsMenu() {
		if (!this.hasCorrectRouteData) {
			return false;
		}

		return !!this.activeContextPane;
	}

	get shouldShowAbout() {
		if (!this.hasCorrectRouteData) {
			return false;
		}

		return this.routeStore!.sidebarData && (!this.isFeaturedChannel || Screen.isMobile);
	}

	onClickMenu() {
		this.toggleLeftPane('context');
	}

	onClickAbout() {
		const { sidebarData, community } = this.routeStore!;
		if (sidebarData) {
			CommunitySidebarModal.show({
				isEditing: this.isEditing,
				data: sidebarData,
				community,
			});
		}
	}

	onClickExtrasOption() {
		Popper.hideAll();
	}
	copyShareUrl() {
		Clipboard.copy(
			Environment.baseUrl + this.$router.resolve(this.community.routeLocation).href
		);

		this.onClickExtrasOption();
	}
}
