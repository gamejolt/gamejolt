import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { User } from '../../user.model';
import AppUserVerifiedTick from '../../verified-tick/verified-tick.vue';
import AppUserAvatar from '../user-avatar.vue';

@Options({
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
