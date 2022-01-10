import { Emit, Inject, Options, Vue } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { FiresideCommunity } from '../../../../_common/fireside/community/community.model';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { setAudioPlayback } from '../../../../_common/fireside/rtc/user';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { Popper } from '../../../../_common/popper/popper.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import { CommunityEjectFiresideModal } from '../../../components/community/eject-fireside/modal/modal.service';
import {
	copyFiresideLink,
	extinguishFireside,
	FiresideController,
	FiresideControllerKey,
	publishFireside,
} from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import { CohostManageModal } from '../cohost/manage/manage-modal.service';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';
import { FiresideEditModal } from '../_edit-modal/edit-modal.service';

@Options({
	components: {
		AppPopper,
		AppCommunityThumbnailImg,
	},
})
export default class AppFiresideSettingsPopper extends Vue {
	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	@Emit('show') emitShow() {}
	@Emit('hide') emitHide() {}

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

	get shouldShowStreamSettings() {
		return this.c.shouldShowStreamingOptions;
	}

	get hasMuteControls() {
		if (!this.c.rtc) {
			return false;
		}
		// Accessing `_users` here instead of `users` so we don't count
		// ourselves.
		return this.c.rtc._users.length > 0;
	}

	get isStreaming() {
		return this.c.isPersonallyStreaming;
	}

	get shouldMute() {
		return this.c.rtc?.users.some(i => !i.micAudioMuted) ?? false;
	}

	muteAll() {
		return this.c.rtc?.users.forEach(i => setAudioPlayback(i, false));
	}

	unmuteAll() {
		return this.c.rtc?.users.forEach(i => setAudioPlayback(i, true));
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

	onClickManageCohosts() {
		CohostManageModal.show(this.c);
	}

	onClickPublish() {
		publishFireside(this.c);
	}

	onClickCopyLink() {
		copyFiresideLink(this.c, this.$router);
	}

	onClickStopStreaming() {
		if (!this.c.rtc?.producer) {
			return;
		}

		Popper.hideAll();
		stopStreaming(this.c.rtc.producer);
	}

	onClickExtinguish() {
		extinguishFireside(this.c);
	}

	onClickReport() {
		ReportModal.show(this.fireside);
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
			showErrorGrowl({
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
			showErrorGrowl({
				message: this.$gettext('Something went wrong while ejecting this fireside...'),
			});
		}
	}
}
