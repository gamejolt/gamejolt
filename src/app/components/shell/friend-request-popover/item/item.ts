import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../../_common/card/card.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/inview.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { UserFriendship } from '../../../../../_common/user/friendship/friendship.model';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Options({
	components: {
		AppScrollInview,
		AppCard,
		AppUserAvatarImg,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellFriendRequestPopoverItem extends Vue {
	@Prop({ type: Object, required: true }) request!: UserFriendship;

	@AppState user!: AppStore['user'];

	isInview = false;
	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

	get them() {
		return this.request.getThem(this.user!);
	}

	/**
	 * Is it a request we sent?
	 */
	get isPending() {
		return this.request.target_user.id !== this.user!.id;
	}

	@Emit() cancel() {}
	@Emit() accept() {}
	@Emit() reject() {}
}
