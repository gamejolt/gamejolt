import { BaseModal } from '../../../../_common/modal/base';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import { Component, Prop } from 'vue-property-decorator';
import { ChatRoom } from '../room';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppChatRoomDetailsModal extends BaseModal {
	@Prop(ChatRoom) room!: ChatRoom;
}
