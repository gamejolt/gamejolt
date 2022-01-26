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
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>
		<div class="modal-body">
			<AppFiresideChatMembers :chat-users="chatUsers" :chat-room="chatRoom" />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
