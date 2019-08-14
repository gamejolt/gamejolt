import { AppTrackEvent } from '../../../../../_common/analytics/track-event.directive';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import { User } from '../../../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import { AppStore } from '../../../../../_common/store/app-store';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppUserVerifiedTick,
		AppUserCardHover,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppUserListItem extends Vue {
	@Prop(User)
	user!: User;

	@Prop(String)
	eventLabel?: string;

	@Prop(Boolean)
	userHoverCard?: boolean;

	@State
	app!: AppStore;

	readonly Screen = Screen;

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}
}
