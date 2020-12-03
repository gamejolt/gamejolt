import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import { ChatClient, ChatKey, editChatRoomTitle } from '../client';
import { ChatRoom } from '../room';
import FormRoomDetails from './form/form.vue';

@Component({
	components: {
		FormRoomDetails,
	},
})
export default class AppChatRoomDetailsModal extends BaseModal {
	@Prop(ChatRoom) room!: ChatRoom;
	@InjectReactive(ChatKey) chat!: ChatClient;

	onSubmit(title: string) {
		editChatRoomTitle(this.chat, title);

		this.modal.dismiss();
	}
}
