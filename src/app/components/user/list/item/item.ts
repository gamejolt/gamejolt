import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppStore } from '../../../../../_common/store/app-store';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import { User } from '../../../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppUserVerifiedTick,
		AppUserCardHover,
	},
})
export default class AppUserListItem extends Vue {
	@Prop(User)
	user!: User;

	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;

	@Prop(Boolean)
	userHoverCard?: boolean;

	@State
	app!: AppStore;

	readonly Screen = Screen;

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}
}
