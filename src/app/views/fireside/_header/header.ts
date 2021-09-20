import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { number } from '../../../../_common/filters/number';
import { FiresideCommunity } from '../../../../_common/fireside/community/community.model';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { Growls } from '../../../../_common/growls/growls.service';
import { Popper } from '../../../../_common/popper/popper.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { CommunityEjectFiresideModal } from '../../../components/community/eject-fireside/modal/modal.service';
import {
	copyFiresideLink,
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';
import { FiresideEditModal } from '../_edit-modal/edit-modal.service';
import { FiresideStatsModal } from '../_stats/modal/modal.service';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppPopper,
		AppUserAvatarImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHeader extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	showControls!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hasOverlayPopovers!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hasInfo!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hasChat!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hasChatStats!: boolean;

	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	readonly number = number;
	readonly Screen = Screen;

	get fireside() {
		return this.c.fireside;
	}

	get canEdit() {
		return this.c.canEdit;
	}

	get manageableCommunities() {
		if (!this.fireside) {
			return [];
		}

		return this.fireside.community_links.filter(i =>
			i.community.hasPerms('community-firesides')
		);
	}

	onClickInfo() {
		FiresideStatsModal.show(this.c);
	}

	onClickShowChatMembers() {
		if (!this.c.chatUsers || !this.c.chatRoom) {
			return;
		}

		FiresideChatMembersModal.show(this.c.chatUsers, this.c.chatRoom);
	}

	onClickEditStream() {
		StreamSetupModal.show(this.c);
	}

	onClickEditFireside() {
		FiresideEditModal.show(this.c);
	}

	onClickCopyLink() {
		copyFiresideLink(this.c, this.$router);
	}

	onClickStopStreaming() {
		if (!this.c.rtc?.producer) {
			return;
		}

		stopStreaming(this.c.rtc.producer);
	}

	onClickReport() {
		ReportModal.show(this.fireside);
	}

	onShowPopper() {
		if (this.hasOverlayPopovers) {
			this.c.isShowingOverlayPopper = true;
		}
	}

	onHidePopper() {
		this.c.isShowingOverlayPopper = false;
	}

	async toggleFeatured(community: FiresideCommunity) {
		Popper.hideAll();
		if (!community.community.hasPerms('community-firesides')) {
			return;
		}

		const isFeaturing = !community.isFeatured;
		try {
			if (isFeaturing) {
				await this.fireside.$feature();
			} else {
				await this.fireside.$unfeature();
			}
		} catch (_) {
			Growls.error({
				message: isFeaturing
					? this.$gettext('Something went wrong while featuring this fireside...')
					: this.$gettext('Something went wrong while unfeaturing this fireside...'),
			});
		}
	}

	async ejectFireside(community: FiresideCommunity) {
		Popper.hideAll();
		if (!community.community.hasPerms('community-firesides')) {
			return;
		}

		const result = await CommunityEjectFiresideModal.show(community, this.fireside);
		if (!result) {
			return;
		}

		try {
			const response = await Api.sendRequest(
				`/web/communities/manage/eject-fireside/${community.id}`,
				result
			);
			if (response.fireside) {
				this.fireside.assign(response.fireside);
			}
		} catch (_) {
			Growls.error({
				message: this.$gettext('Something went wrong while ejecting this fireside...'),
			});
		}
	}
}
