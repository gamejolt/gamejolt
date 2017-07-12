import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./user-list.html';

import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import { AppChatUserListItem } from './item/item';

@View
@Component({
	components: {
		AppChatUserListItem,
	},
})
export class AppChatUserList extends Vue {
	@Prop(Array) users: ChatUser[];
	@Prop(ChatRoom) room?: ChatRoom;
	@Prop(Boolean) showPm?: boolean;
	@Prop(Boolean) showModTools?: boolean;

	filterQuery = '';
}
