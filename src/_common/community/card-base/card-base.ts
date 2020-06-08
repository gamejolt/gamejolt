import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { number } from '../../filters/number';
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

	readonly number = number;

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
}
