import AppScrollScroller from 'game-jolt-frontend-lib/components/scroll/scroller/scroller.vue';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Community } from '../../../../../lib/gj-lib-client/components/community/community.model';
import { FormOnLoad } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { OnboardingStep } from '../../../../../lib/gj-lib-client/components/onboarding/onboarding.service';
import OnboardingComponent from '../base';
import AppOnboardingFollowsCommunityItem from './community-item/community-item.vue';

@Component({
	components: {
		AppOnboardingFollowsCommunityItem,
		AppScrollScroller,
	},
})
export default class FormOnboardingFollows extends OnboardingComponent<any> implements FormOnLoad {
	stepName = 'follow' as OnboardingStep;

	followedGames = false;
	communities: Community[] = [];

	get loadUrl() {
		return '/web/onboarding/follows';
	}

	get canContinue() {
		return this.valid;
	}

	get shouldShowSkip() {
		return !this.followedGames || !this.followsAnyCommunity;
	}

	get followsAnyCommunity() {
		return this.communities.find(c => !!c.is_member);
	}

	onLoad(payload: any) {
		this.communities = Community.populate(payload.communities);
	}

	onFollowGames() {
		this.followedGames = true;

		// We'd rather fail silently, so detach this.
		Api.sendRequest(
			'/web/onboarding/follows/save',
			{},
			{
				detach: true,
			}
		);
	}
}
