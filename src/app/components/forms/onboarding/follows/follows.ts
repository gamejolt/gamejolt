import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import {
	FormOnBeforeSubmit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
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
export default class FormOnboardingFollows extends OnboardingComponent<any>
	implements FormOnLoad, FormOnBeforeSubmit {
	stepName = 'follows' as OnboardingStep;

	communities: Community[] = [];

	get loadUrl() {
		return '/web/onboarding/follows';
	}

	get canContinue() {
		return this.valid;
	}

	get shouldShowSkip() {
		return !this.followsAnyCommunity;
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

	onBeforeSubmit() {
		Onboarding.trackEvent(
			this.followsAnyCommunity ? 'follow-communities-set' : 'follow-communities-skip'
		);
	}
}
