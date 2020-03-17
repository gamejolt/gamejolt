import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { User } from '../../../../_common/user/user.model';

@Component({})
export default class AppUserBlockOverlay extends Vue {
	@Prop(User)
	user!: User;

	private hasBypassed = false;

	get shouldBlock() {
		return this.user && this.user.is_blocked && !this.hasBypassed;
	}

	@Watch('user', { immediate: true })
	onWatch(newUser: User, oldUser?: User) {
		if (!oldUser || newUser.id !== oldUser.id) {
			this.hasBypassed = false;
		}
	}

	proceed() {
		this.hasBypassed = true;
		Scroll.to(0, { animate: false });
	}
}
