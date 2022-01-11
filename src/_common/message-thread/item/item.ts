import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../../filters/date';
import { AppTimeAgo } from '../../time/ago/ago';
import AppTimelineListItem from '../../timeline-list/item/item.vue';
import AppUserCardHover from '../../user/card/hover/hover.vue';
import AppUserAvatar from '../../user/user-avatar/user-avatar.vue';
import { User } from '../../user/user.model';
import AppUserVerifiedTick from '../../user/verified-tick/verified-tick.vue';

@Options({
	components: {
		AppTimelineListItem,
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
		AppUserVerifiedTick,
	},
})
export default class AppMessageThreadItem extends Vue {
	@Prop({ type: Object, required: true }) user!: User;
	@Prop(Object) repliedTo?: User;
	@Prop({ type: Number, required: true }) date!: number;
	@Prop(String) id?: string;
	@Prop({ type: Boolean, default: false }) isActive!: boolean;
	@Prop({ type: Boolean, default: false }) isNew!: boolean;
	@Prop({ type: Boolean, default: false }) isReply!: boolean;
	@Prop({ type: Boolean, default: false }) isLast!: boolean;
	@Prop({ type: Boolean, default: false }) isShowingReplies!: boolean;
	@Prop({ type: Boolean, default: false }) isBlocked!: boolean;

	readonly formatDate = formatDate;
}
