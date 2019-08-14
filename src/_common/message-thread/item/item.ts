import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue';
import { date } from '../../../vue/filters/date';
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
		AppJolticon,
		AppUserVerifiedTick,
	},
})
export default class AppMessageThreadItem extends Vue {
	@Prop(User) user!: User;
	@Prop(User) repliedTo?: User;
	@Prop(Number) date!: number;
	@Prop(String) id?: string;
	@Prop(Boolean) isActive?: boolean;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isReply?: boolean;
	@Prop(Boolean) isLast?: boolean;

	@Prop(Boolean) isShowingReplies?: boolean;

	dateFilter = date;
}
