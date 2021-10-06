import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import AppLoadingFade from '../../../../../_common/loading/fade/fade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { leaveGroupRoom } from '../../client';
import AppChatNotificationSettings from '../../notification-settings/notification-settings.vue';
import { ChatRoom } from '../../room';
import { ChatRoomDetailsModal } from '../../room-details-modal/room-details-modal.service';

@Component({
	components: {
		AppPopper,
		AppLoadingFade,
		AppChatNotificationSettings,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatWindowMenu extends Vue {
	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;

	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	get chat() {
		return this.chatStore.chat!;
	}

	get isOwner() {
		return (
			this.room && this.chat.currentUser && this.room.owner_id === this.chat.currentUser.id
		);
	}

	get shouldShowEdit() {
		return !this.room.isPmRoom && this.isOwner;
	}

	get shouldShowLeave() {
		return !this.room.isPmRoom;
	}

	onClickEditTitle() {
		if (!this.isOwner) {
			return;
		}

		ChatRoomDetailsModal.show(this.room);
	}

	async leaveRoom() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to leave the group chat?`)
		);

		if (!result) {
			return;
		}

		leaveGroupRoom(this.chat, this.room);
	}
}
