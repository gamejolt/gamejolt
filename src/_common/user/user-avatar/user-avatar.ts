import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { User } from '../user.model';
import AppUserAvatarImg from './img/img.vue';

@Component({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppUserAvatar extends Vue {
	@Prop(Object)
	user!: User;

	@Prop(String)
	link?: string;

	get href() {
		if (this.user) {
			if (!this.link) {
				return Environment.wttfBaseUrl + this.user.url;
			} else if (this.link === 'dashboard') {
				return Environment.wttfBaseUrl;
			} else if (this.link === 'fireside') {
				return Environment.firesideBaseUrl + '/@' + this.user.username;
			}
		}
	}
}
