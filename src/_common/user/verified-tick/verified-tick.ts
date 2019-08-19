import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip';
import { User } from '../user.model';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppUserVerifiedTick extends Vue {
	@Prop(User)
	user!: User;

	@Prop(Boolean)
	highlight!: boolean;

	@Prop(Boolean)
	big!: boolean;

	@Prop(Boolean)
	small!: boolean;

	@Prop(Boolean)
	verticalAlign!: boolean;

	get shouldShow() {
		return this.user.is_verified;
	}

	get icon() {
		if (this.user.is_verified) {
			return 'verified';
		}
	}

	get tooltip() {
		if (this.user.is_verified) {
			return this.$gettext('Verified Account');
		}
	}
}
