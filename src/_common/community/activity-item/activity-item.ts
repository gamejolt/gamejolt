import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { RawLocation } from 'vue-router';
import { propRequired } from '../../../utils/vue';
import { date } from '../../filters/date';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { Screen } from '../../screen/screen-service';
import { AppTimeAgo } from '../../time/ago/ago';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { UserBlock } from '../../user/block/block.model';
import AppUserAvatar from '../../user/user-avatar/user-avatar.vue';
import { User } from '../../user/user.model';
import { CommunityChannel } from '../channel/channel.model';
import { CommunityActivityItem } from './activity-item.model';

@Component({
	components: {
		AppTimeAgo,
		AppUserAvatar,
	},
	filters: {
		date,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityActivityItem extends Vue {
	@Prop(propRequired(CommunityActivityItem)) item!: CommunityActivityItem;
	@Prop(propRequired(Boolean)) usersplit!: boolean;
	@Prop(propRequired(Boolean)) showIcon!: boolean;

	readonly Screen = Screen;
	readonly date = date;
	readonly CommunityActivityItem = CommunityActivityItem;

	get loggedOn() {
		return date(this.item.added_on, 'medium');
	}

	get shouldShowIcon() {
		return !!this.icon && this.showIcon;
	}

	get icon() {
		return this.item.getTypeIcon()?.icon;
	}

	get color() {
		return this.item.getTypeIcon()?.color;
	}

	get actionIsFiresidePost() {
		return this.item.action_resource instanceof FiresidePost;
	}

	get actionIsUser() {
		return this.item.action_resource instanceof User;
	}

	get isToday() {
		return date(this.item.added_on, 'mediumDate') === date(Date.now(), 'mediumDate');
	}

	get isYesterday() {
		const oneDay = 24 * 60 * 60 * 1000;
		return date(this.item.added_on, 'mediumDate') === date(Date.now() - oneDay, 'mediumDate');
	}

	get actionTo(): RawLocation | undefined {
		if (this.item.action_resource instanceof FiresidePost) {
			return this.item.action_resource.routeLocation;
		} else if (this.item.action_resource instanceof User) {
			return this.item.action_resource.url;
		} else if (this.item.action_resource instanceof UserBlock) {
			return this.item.action_resource.user.url;
		} else if (this.item.action_resource instanceof CommunityChannel) {
			return {
				name: 'communities.view.channel',
				params: {
					channel: this.item.action_resource.title,
				},
			};
		} else if (this.item.action_resource instanceof Game) {
			return this.item.action_resource.routeLocation;
		}
	}

	get actionText() {
		if (this.item.action_resource instanceof FiresidePost) {
			return this.item.action_resource.getShortLead();
		} else if (this.item.action_resource instanceof User) {
			return '@' + this.item.action_resource.username;
		} else if (this.item.action_resource instanceof UserBlock) {
			return this.$gettextInterpolate('@%{ username } for %{ reason }', {
				username: this.item.action_resource.user.username,
				reason: this.item.action_resource.reason,
			});
		} else if (this.item.action_resource instanceof CommunityChannel) {
			return '#' + this.item.action_resource.title;
		} else if (this.item.action_resource instanceof Game) {
			return this.item.action_resource.title;
		}
	}

	get shouldShowActionSecondLine() {
		return !!this.actionTo || !!this.actionText;
	}

	get extraData(): Record<string, any> {
		return JSON.parse(this.item.extra_data);
	}

	getExtraData(key: string) {
		return this.extraData[key];
	}
}
