<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { leaveGroupRoom } from '../../client';
import AppChatNotificationSettings from '../../notification-settings/notification-settings.vue';
import { ChatRoom } from '../../room';
import { ChatRoomDetailsModal } from '../../room-details-modal/room-details-modal.service';

@Options({
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
	@Prop({ type: Object, required: true }) room!: ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

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
</script>

<template>
	<AppPopper popover-class="fill-darkest" placement="bottom">
		<AppButton v-app-tooltip="$gettext(`Manage...`)" circle sparse trans icon="ellipsis-h" />

		<template #popover>
			<div class="fill-darker">
				<div class="list-group list-group-dark">
					<template v-if="shouldShowEdit">
						<a class="list-group-item has-icon" @click="onClickEditTitle">
							<AppJolticon icon="edit" />
							<AppTranslate>Change title</AppTranslate>
						</a>

						<hr />
					</template>

					<AppChatNotificationSettings
						:room-id="room.id"
						:is-pm-room="room.isPmRoom"
					/>

					<template v-if="shouldShowLeave">
						<hr />
						<a class="list-group-item has-icon" @click="leaveRoom">
							<AppJolticon icon="logout" notice />
							<AppTranslate>Leave Room</AppTranslate>
						</a>
					</template>
				</div>
			</div>
		</template>
	</AppPopper>
</template>
