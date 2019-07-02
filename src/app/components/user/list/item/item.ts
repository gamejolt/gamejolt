import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow/widget.vue';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
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

	@State
	app!: AppStore;

	readonly Screen = Screen;

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}
}
