import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/inview.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, isUserOnline, tryGetRoomRole } from '../../client';
import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';
import AppChatUserPopover from '../../user-popover/user-popover.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Options({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
		AppPopper,
		AppChatUserPopover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatMemberListItem extends Vue {
	@Inject({ from: ChatKey })
	chat!: ChatClient;

	@Prop(propRequired(ChatUser)) user!: ChatUser;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

	isInview = false;

	get isOnline() {
		if (!this.chat) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	get isOwner() {
		return this.room.owner_id === this.user.id;
	}

	get isModerator() {
		const role = tryGetRoomRole(this.chat, this.room, this.user);
		return role === 'moderator';
	}
}
