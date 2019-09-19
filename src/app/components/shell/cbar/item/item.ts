import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { Store } from '../../../../store';
import { AppCommunityPerms } from '../../../community/perms/perms';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppPopper,
		AppCommunityPerms,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarItem extends Vue {
	@Prop(Community)
	community!: Community;

	@AppState
	user!: AppStore['user'];

	@State
	grid!: Store['grid'];

	@Action
	leaveCommunity!: Store['leaveCommunity'];

	popperVisible = false;

	readonly Environment = Environment;

	get isUnread() {
		return this.community.is_unread;
	}

	get isActive() {
		return (
			this.$route.name &&
			this.$route.name.indexOf('communities.view') === 0 &&
			this.$route.params.path === this.community!.path
		);
	}

	get highlight() {
		const highlight = this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
		}
		return null;
	}

	get tooltip() {
		// Don't show the tooltip if the right click popper is visible.
		return this.popperVisible ? '' : this.community.name;
	}

	get shouldShowModerate() {
		return this.user && this.user.isMod;
	}

	get isCommunityOwner() {
		return this.community.hasPerms('all');
	}

	async onLeaveCommunityClick() {
		Popper.hideAll();

		if (this.community.hasPerms()) {
			const confirmed = await ModalConfirm.show(
				this.$gettext(
					'You will no longer be a moderator for this community. Are you sure?'
				),
				this.$gettext('Resign from Community?'),
				'yes'
			);

			if (!confirmed) {
				return;
			}
		}

		await this.leaveCommunity(this.community);
	}

	gotoModerate() {
		Popper.hideAll();

		Navigate.newWindow(Environment.baseUrl + `/moderate/games/view/${this.community.id}`);
	}
}
