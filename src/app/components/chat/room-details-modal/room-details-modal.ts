import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
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
