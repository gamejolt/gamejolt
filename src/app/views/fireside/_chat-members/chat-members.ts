import { Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppChatMemberList from '../../../components/chat/member-list/member-list.vue';
import { ChatRoom } from '../../../components/chat/room';
import { ChatUserCollection } from '../../../components/chat/user-collection';

@Options({
	components: {
		AppScrollScroller,
		AppChatMemberList,
	},
})
export default class AppFiresideChatMembers extends Vue {
	@Prop({ type: ChatUserCollection, required: true })
	chatUsers!: ChatUserCollection;

	@Prop({ type: ChatRoom, required: true })
	chatRoom!: ChatRoom;
}
