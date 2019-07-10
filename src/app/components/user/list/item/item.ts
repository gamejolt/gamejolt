import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow/widget.vue';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppUserVerifiedTick from 'game-jolt-frontend-lib/components/user/verified-tick/verified-tick.vue';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
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
