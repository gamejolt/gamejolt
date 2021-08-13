import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import { ChatRoom } from '../../../../components/chat/room';
import { ChatUserCollection } from '../../../../components/chat/user-collection';
import AppFiresideChatMembers from '../chat-members.vue';

@Component({
	components: {
		AppFiresideChatMembers,
	},
})
export default class AppFiresideChatMembersModal extends BaseModal {
	@Prop({ type: ChatUserCollection, required: true })
	chatUsers!: ChatUserCollection;

	@Prop({ type: ChatRoom, required: true })
	chatRoom!: ChatRoom;
}
