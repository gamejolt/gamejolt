import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { date } from '../../filters/date';
import { AppTimeAgo } from '../../time/ago/ago';
import AppTimelineListItem from '../../timeline-list/item/item.vue';
import AppUserCardHover from '../../user/card/hover/hover.vue';
import AppUserAvatar from '../../user/user-avatar/user-avatar.vue';
import { User } from '../../user/user.model';
import AppUserVerifiedTick from '../../user/verified-tick/verified-tick.vue';

@Component({
	components: {
		AppTimelineListItem,
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
		AppUserVerifiedTick,
	},
})
export default class AppMessageThreadItem extends Vue {
	@Prop(propRequired(User)) user!: User;
	@Prop(propOptional(User)) repliedTo?: User;
	@Prop(propRequired(Number)) date!: number;
	@Prop(propOptional(String)) id?: string;
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) isNew!: boolean;
	@Prop(propOptional(Boolean, false)) isReply!: boolean;
	@Prop(propOptional(Boolean, false)) isLast!: boolean;
	@Prop(propOptional(Boolean, false)) isShowingReplies!: boolean;
	@Prop(propOptional(Boolean, false)) isBlocked!: boolean;

	dateFilter = date;
}
