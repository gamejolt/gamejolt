import { readableColor } from 'polished';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import Onboarding from '../../../../../../_common/onboarding/onboarding.service';
import { Store } from '../../../../../store';

@Component({
	components: {
		AppCommunityThumbnailImg,
	},
})
export default class AppOnboardingFollowsCommunityItem extends Vue {
	@Prop(Community)
	community!: Community;

	@Action
	joinCommunity!: Store['joinCommunity'];

	@Action
	leaveCommunity!: Store['leaveCommunity'];

	readonly readableColor = readableColor;

	get highlight() {
		const highlight = this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
		}
		return null;
	}

	get highlightFg() {
		const highlightFg = this.community.theme && this.community.theme.highlightFg_;
		if (highlightFg) {
			return '#' + highlightFg;
		}
		return null;
	}

	async toggleJoin() {
		// This matches what's on community join widget. Seems odd but okay.
		Analytics.trackEvent(
			'community-join',
			'onboarding',
			this.community.is_member ? 'leave' : 'join'
		);

		// Onboarding analytics too
		Onboarding.trackEvent(
			this.community.is_member ? 'community-leave' : 'community-join',
			`${this.community.id}-${this.community.path}`
		);

		if (!this.community.is_member) {
			this.joinCommunity(this.community);
		} else {
			this.leaveCommunity(this.community);
		}
	}
}
