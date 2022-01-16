<script lang="ts">
import { Inject, mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import { ChatStore, ChatStoreKey } from '../chat-store';
import { editChatRoomTitle } from '../client';
import { ChatRoom } from '../room';
import { FormModel } from './form/form';
import FormRoomDetails from './form/form.vue';

@Options({
	components: {
		FormRoomDetails,
	},
})
export default class AppChatRoomDetailsModal extends mixins(BaseModal) {
	@Prop(Object) room!: ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get chat() {
		return this.chatStore.chat!;
	}

	onSubmit(model: FormModel) {
		editChatRoomTitle(this.chat, model.title);

		this.modal.dismiss();
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Edit group details</translate>
			</h2>
		</div>

		<div class="modal-body">
			<form-room-details :model="room" @submit="onSubmit($event)" />
		</div>
	</app-modal>
</template>
