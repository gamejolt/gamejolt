import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { number } from '../../../../_common/filters/number';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import {
	copyFiresideLink,
	FiresideController,
	FiresideControllerKey,
	showFiresideMembers,
} from '../../../components/fireside/controller/controller';
import { FiresideEditModal } from '../_edit-modal/edit-modal.service';
import { FiresideStatsModal } from '../_stats/modal/modal.service';
import { StreamSetupModal } from '../_stream-setup/stream-setup-modal.service';

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
	hasEdit!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hasChatStats!: boolean;

	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	readonly number = number;
	readonly Screen = Screen;

	get fireside() {
		return this.c.fireside;
	}

	onClickInfo() {
		FiresideStatsModal.show(this.c);
	}

	onClickShowChatMembers() {
		showFiresideMembers(this.c);
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

	onShowPopper() {
		if (this.hasOverlayPopovers) {
			this.c.isShowingOverlayPopper = true;
		}
	}

	onHidePopper() {
		this.c.isShowingOverlayPopper = false;
	}
}
