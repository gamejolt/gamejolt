import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./room-details-modal.html';

import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { ChatRoom } from '../room';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export default class AppChatRoomDetailsModal extends BaseModal {
	@Prop(ChatRoom) room!: ChatRoom;
}
