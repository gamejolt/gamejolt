import { Api } from '../../../../../_common/api/api.service';
import { Community } from '../../../../../_common/community/community.model';
import { FormOnBeforeSubmit, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import Onboarding, { OnboardingStep } from '../../../../../_common/onboarding/onboarding.service';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { Component } from 'vue-property-decorator';
import OnboardingComponent from '../base';
import AppOnboardingFollowsCommunityItem from './community-item/community-item.vue';

@Component({
	components: {
		AppOnboardingFollowsCommunityItem,
		AppScrollScroller,
	},
})
export default class FormOnboardingFollows extends OnboardingComponent<any>
	implements FormOnLoad, FormOnBeforeSubmit {
	stepName = 'follows' as OnboardingStep;

	followedGames = false;
	communities: Community[] = [];

	get loadUrl() {
		return '/web/onboarding/follows';
	}

	get canContinue() {
		return this.valid;
	}

	get shouldShowSkip() {
		return !this.followedGames && !this.followsAnyCommunity;
	}

	get followsAnyCommunity() {
		return this.communities.find(c => !!c.is_member);
	}

	created() {
		super.created();
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

	onBeforeSubmit() {
		if (!this.followedGames) {
			Onboarding.trackEvent('follow-games-skip');
		}

		Onboarding.trackEvent(
			this.followsAnyCommunity ? 'follow-communities-set' : 'follow-communities-skip'
		);
	}
}
