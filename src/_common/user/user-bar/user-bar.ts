import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { User } from '../user.model';
import { Environment } from '../../environment/environment.service';
import AppUserAvatarImg from '../user-avatar/img/img.vue';

@Component({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppUserBar extends Vue {
	@Prop(User) user!: User;
	@Prop(String) site!: string;
	@Prop(Boolean) hideSiteSelector?: boolean;

	get userLink() {
		// User link on fireside goes to their fireside profile if they are an
		// approved author.
		if (this.site === 'fireside' && this.user && this.user.can_manage) {
			return '/@' + this.user.username;
		}

		return Environment.baseUrl + '/dashboard';
	}
}
