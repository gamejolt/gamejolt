import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { ChatRoom } from '../room';
import AppChatRoomListItem from './item/item.vue';

@Component({
	components: {
		AppChatRoomListItem,
	},
})
export default class AppChatRoomList extends Vue {
	@Prop(propRequired(Array)) rooms!: ChatRoom[];
}
