import View from '!view!./item.html?style=./item.styl';
import { AppCard } from 'game-jolt-frontend-lib/components/card/card';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppScrollInview } from 'game-jolt-frontend-lib/components/scroll/inview/inview';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import { AppUserAvatarImg } from 'game-jolt-frontend-lib/components/user/user-avatar/img/img';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppScrollInview,
		AppCard,
		AppUserAvatarImg,
	},
	directives: {
		AppTooltip,
	},
})
export class AppShellFriendRequestPopoverItem extends Vue {
	@Prop(UserFriendship)
	request!: UserFriendship;

	@AppState
	user!: AppStore['user'];

	isInview = false;

	readonly Screen = Screen;

	get them() {
		return this.request.getThem(this.user!);
	}

	/**
	 * Is it a request we sent?
	 */
	get isPending() {
		return this.request.target_user.id !== this.user!.id;
	}

	@Emit()
	cancel() {}

	@Emit()
	accept() {}

	@Emit()
	reject() {}
}
