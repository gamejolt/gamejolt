import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { propOptional, propRequired } from '../../../utils/vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { formatNumber } from '../../filters/number';
import AppLoading from '../../loading/loading.vue';
import { AppStore } from '../../store/app-store';
import { AppTheme } from '../../theme/theme';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppUserFollowWidget from '../follow/widget.vue';
import AppUserAvatarImg from '../user-avatar/img/img.vue';
import { User } from '../user.model';
import AppUserVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppTheme,
		AppLoading,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppUserCard extends Vue {
	@Prop(propRequired(User)) user!: User;
	@Prop(propOptional(Boolean, false)) isLoading!: boolean;
	@Prop(propOptional(Boolean, false)) elevate!: boolean;

	@State app!: AppStore;

	readonly formatNumber = formatNumber;
	readonly formatFuzzynumber = formatFuzzynumber;

	get followerCount() {
		return this.user.follower_count || 0;
	}

	get followingCount() {
		return this.user.following_count || 0;
	}

	get postCount() {
		return this.user.post_count || 0;
	}

	get gameCount() {
		return this.user.game_count || 0;
	}

	get likeCount() {
		return this.user.like_count || 0;
	}

	get headerBackgroundImage() {
		return this.user.header_media_item
			? `url('${this.user.header_media_item.mediaserver_url}')`
			: undefined;
	}
}
