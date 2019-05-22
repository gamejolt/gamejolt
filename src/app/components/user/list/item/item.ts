import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow-widget/follow-widget.vue';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
	},
})
export default class AppUserListItem extends Vue {
	@Prop(User)
	user!: User;

	@Prop(String)
	followEventLabel?: string;

	@State
	app!: AppStore;

	get realFollowEventLabel() {
		return this.followEventLabel || 'user-list';
	}

	readonly Screen = Screen;
}
