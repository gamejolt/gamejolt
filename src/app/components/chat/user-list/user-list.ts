import { AppScrollInviewParent } from 'game-jolt-frontend-lib/components/scroll/inview/parent';
import { fuzzysearch } from 'game-jolt-frontend-lib/utils/string';
import { findVueParent } from 'game-jolt-frontend-lib/utils/vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserListItem from './item/item.vue';

@Component({
	components: {
		AppChatUserListItem,
	},
})
export default class AppChatUserList extends Vue {
	@Prop(Array)
	users!: ChatUser[];

	@Prop(ChatRoom)
	room?: ChatRoom;

	@Prop(Boolean)
	showPm?: boolean;

	@Prop(Boolean)
	showModTools?: boolean;

	filterQuery = '';

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.users;
		}

		const filter = this.filterQuery.toLowerCase();
		return this.users.filter(
			i =>
				fuzzysearch(filter, i.displayName.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}

	/**
	 * When our list changes, make sure to recheck items in view since things shifted.
	 */
	@Watch('filteredUsers')
	onUsersChange() {
		const inviewParent = findVueParent(this, AppScrollInviewParent);
		if (inviewParent) {
			inviewParent.queueCheck();
		}
	}
}
