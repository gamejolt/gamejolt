import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppJolticon from '../../../jolticon/jolticon.vue';
import AppLoading from '../../../loading/loading.vue';
import { number } from '../../filters/number';
import { AppStore } from '../../store/app-store';
import { AppTheme } from '../../theme/theme';
import { AppTooltipContainer } from '../../tooltip/container/container';
import { AppTooltip } from '../../tooltip/tooltip';
import AppUserFollowWidget from '../follow/widget.vue';
import AppUserAvatarImg from '../user-avatar/img/img.vue';
import { User } from '../user.model';
import AppUserVerifiedTick from '../verified-tick/verified-tick.vue';
import './card-global.styl';

@Component({
	components: {
		AppJolticon,
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppTheme,
		AppTooltipContainer,
		AppLoading,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppUserCard extends Vue {
	@Prop(User)
	user!: User;

	@Prop(Boolean)
	isLoading?: boolean;

	@State
	app!: AppStore;

	readonly number = number;

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

	get videoCount() {
		return this.user.video_count || 0;
	}

	get headerBackgroundImage() {
		return this.user.header_media_item
			? `url('${this.user.header_media_item.mediaserver_url}')`
			: undefined;
	}
}
