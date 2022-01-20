<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import { ChatRoom } from '../../../../components/chat/room';
import { ChatUserCollection } from '../../../../components/chat/user-collection';
import AppFiresideChatMembers from '../AppFiresideChatMembers.vue';

@Options({
	components: {
		AppFiresideChatMembers,
	},
})
export default class AppFiresideChatMembersModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	chatUsers!: ChatUserCollection;

	@Prop({ type: Object, required: true })
	chatRoom!: ChatRoom;
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<app-fireside-chat-members :chat-users="chatUsers" :chat-room="chatRoom" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
