import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { number } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';
import AppFiresideSettingsPopper from '../_settings-popper/settings-popper.vue';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppUserAvatarImg,
		AppFiresideSettingsPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHeader extends Vue {
	@Prop({ type: Boolean, default: false })
	showControls!: boolean;

	@Prop({ type: Boolean, default: false })
	hasChat!: boolean;

	@Prop({ type: Boolean, default: false })
	hasChatStats!: boolean;

	@Prop({ type: Boolean, default: false })
	isOverlay!: boolean;

	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	readonly number = number;
	readonly Screen = Screen;

	get fireside() {
		return this.c.fireside;
	}

	get memberCount() {
		return this.c.chatRoom?.members.length ?? 1;
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

	onShowPopper() {
		if (this.isOverlay) {
			this.c.isShowingOverlayPopper = true;
		}
	}

	onHidePopper() {
		this.c.isShowingOverlayPopper = false;
	}
}
