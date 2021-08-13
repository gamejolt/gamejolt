import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propOptional, propRequired } from '../../../../utils/vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatMemberListItem from './item/item.vue';

@Component({
	components: {
		AppChatMemberListItem,
	},
})
export default class AppChatMemberList extends Vue {
	@Prop(propRequired(Array)) users!: ChatUser[];
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propOptional(Boolean, false)) hideFilter!: boolean;

	filterQuery = '';

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.users;
		}

		const query = this.filterQuery.toLowerCase().trim();
		return this.users.filter(
			i =>
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
		);
	}
}
