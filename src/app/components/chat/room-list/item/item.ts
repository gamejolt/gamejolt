import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, enterChatRoom, leaveGroupRoom } from '../../client';
import { ChatRoom } from '../../room';

@Component({
	components: {
		AppPopper,
		AppScrollInview,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatRoomListItem extends Vue {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@InjectReactive(ChatKey) chat!: ChatClient;

	isInview = false;
	popperVisible = false;

	readonly Screen = Screen;

	get chatNotificationsCount() {
		return number(this.chat.notifications[this.room.id] || 0);
	}

	onRoomClicked(roomId: number) {
		enterChatRoom(this.chat, roomId);
	}

	async leaveRoom() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to leave ${this.room.getGroupTitle(this.chat)}?`),
			undefined,
			'yes'
		);

		if (!result) {
			return;
		}

		leaveGroupRoom(this.chat);
	}
}
