import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import { ChatRoom } from '../room';

@Component({})
export default class AppChatRoomDetailsModal extends BaseModal {
	@Prop(ChatRoom) room!: ChatRoom;
}
