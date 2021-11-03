import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ChatUser } from '../../../app/components/chat/user';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { User } from '../user.model';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppUserVerifiedTick extends Vue {
	@Prop(Object)
	user!: User | ChatUser;

	@Prop(Boolean)
	highlight!: boolean;

	@Prop(Boolean)
	big!: boolean;

	@Prop(Boolean)
	small!: boolean;

	@Prop(Boolean)
	verticalAlign!: boolean;

	get shouldShow() {
		return this.user.is_verified || this.user.permission_level > 0;
	}

	get icon() {
		if (this.user.permission_level > 0) {
			return this.big ? 'bolt-unfilled' : 'bolt-filled';
		} else if (this.user.is_verified) {
			return 'verified';
		}
	}

	get tooltip() {
		if (this.user.permission_level > 0) {
			return this.$gettext(`Game Jolt Staff`);
		} else if (this.user.is_verified) {
			return this.$gettext(`Verified Account`);
		}
	}
}
