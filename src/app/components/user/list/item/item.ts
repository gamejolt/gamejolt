import View from '!view!./item.html?style=./item.styl';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppUserAvatarImg } from 'game-jolt-frontend-lib/components/user/user-avatar/img/img';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
})
export class AppUserListItem extends Vue {
	@Prop(User)
	user!: User;

	readonly Screen = Screen;
}
