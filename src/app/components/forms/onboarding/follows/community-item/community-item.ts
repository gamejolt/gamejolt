import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import {
	$joinCommunity,
	$leaveCommunity,
	Community,
} from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityThumbnailImg from 'game-jolt-frontend-lib/components/community/thumbnail/img/img.vue';
import Onboarding from 'game-jolt-frontend-lib/components/onboarding/onboarding.service';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppCommunityThumbnailImg,
	},
})
export default class AppOnboardingFollowsCommunityItem extends Vue {
	@Prop(Community)
	community!: Community;

	get highlight() {
		const highlight = this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
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
			$joinCommunity(this.community);
		} else {
			$leaveCommunity(this.community);
		}
	}
}
