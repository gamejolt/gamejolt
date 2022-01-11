import { Options, Prop, Vue } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propOptional } from '../../../../utils/vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatMemberListItem from './item/item.vue';

@Options({
	components: {
		AppChatMemberListItem,
	},
})
export default class AppChatMemberList extends Vue {
	@Prop({ type: Array, required: true }) users!: ChatUser[];
	@Prop({ type: Object, required: true }) room!: ChatRoom;
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
