import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import { Environment } from '../../environment/environment.service';
import { formatNumber } from '../../filters/number';
import { AppState, AppStore } from '../../store/app-store';
import { AppTheme } from '../../theme/theme';
import { Community, isEditingCommunity } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/join-widget.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppTheme,
		AppCommunityVerifiedTick,
		AppCommunityJoinWidget,
	},
})
export default class AppCommunityCardBase extends Vue {
	@Prop(propRequired(Object)) community!: Community;
	@Prop(propOptional(Boolean, false)) overflow!: boolean;
	@Prop(propOptional(Boolean, false)) elevate!: boolean;
	@Prop(propOptional(Boolean, true)) allowEdit!: boolean;
	@Prop(propOptional(Boolean, false)) trackGoto!: boolean;

	@AppState user!: AppStore['user'];

	readonly formatNumber = formatNumber;
	readonly Environment = Environment;

	get memberCount() {
		return this.community.member_count || 0;
	}

	get headerBackgroundImage() {
		return this.community.header
			? `url('${this.community.header.mediaserver_url}')`
			: undefined;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	get shouldShowModTools() {
		return this.user && this.user.isMod;
	}

	trackGotoCommunity() {
		if (this.trackGoto) {
			trackGotoCommunity({
				source: 'card',
				id: this.community.id,
				path: this.community.path,
			});
		}
	}
}
