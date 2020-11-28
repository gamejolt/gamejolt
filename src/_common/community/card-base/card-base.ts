import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { Environment } from '../../environment/environment.service';
import { number } from '../../filters/number';
import { AppState, AppStore } from '../../store/app-store';
import { AppTheme } from '../../theme/theme';
import { Community, isEditingCommunity } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/join-widget.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

/**
 * Used as a base to compose on top of for either showing the normal community
 * card, or the one that we show in the community page itself.
 */
@Component({
	components: {
		AppTheme,
		AppCommunityVerifiedTick,
		AppCommunityJoinWidget,
	},
})
export default class AppCommunityCardBase extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propOptional(Boolean, false)) overflow!: boolean;
	@Prop(propOptional(Boolean, false)) elevate!: boolean;
	@Prop(propOptional(Boolean, true)) allowEdit!: boolean;

	@AppState user!: AppStore['user'];

	readonly number = number;
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
}
