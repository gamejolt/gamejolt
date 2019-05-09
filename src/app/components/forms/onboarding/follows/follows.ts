import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { FormOnLoad } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import Onboarding, {
	OnboardingStep,
} from 'game-jolt-frontend-lib/components/onboarding/onboarding.service';
import AppScrollScroller from 'game-jolt-frontend-lib/components/scroll/scroller/scroller.vue';
import { Component } from 'vue-property-decorator';
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
		Onboarding.trackEvent('follow-games-set');
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

	async onSubmit() {
		if (!this.followedGames) {
			Onboarding.trackEvent('follow-games-skip');
		}

		Onboarding.trackEvent(
			this.followsAnyCommunity ? 'follow-communities-set' : 'follow-communities-skip'
		);
	}
}
