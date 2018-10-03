import View from '!view!./item.html?style=./item.styl';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppUserFollowWidget } from 'game-jolt-frontend-lib/components/user/follow-widget/follow-widget';
import { AppUserAvatarImg } from 'game-jolt-frontend-lib/components/user/user-avatar/img/img';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

@View
@Component({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
	},
})
export class AppUserListItem extends Vue {
	@Prop(User)
	user!: User;

	@State
	app!: AppStore;

	readonly Screen = Screen;
}
