import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../components/tooltip/tooltip';
import { User } from '../../user.model';
import AppUserVerifiedTick from '../../verified-tick/verified-tick.vue';
import AppUserAvatar from '../user-avatar.vue';

@Component({
	components: {
		AppUserAvatar,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppUserAvatarList extends Vue {
	@Prop(Array)
	users!: User[];

	@Prop(Boolean)
	sm?: boolean;

	@Prop(Boolean)
	inline?: boolean;
}
