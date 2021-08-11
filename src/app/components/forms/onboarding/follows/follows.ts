import { Options } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { FormOnBeforeSubmit, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import Onboarding, { OnboardingStep } from '../../../../../_common/onboarding/onboarding.service';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import OnboardingComponent from '../base';
import AppOnboardingFollowsCommunityItem from './community-item/community-item.vue';

@Options({
	components: {
		AppOnboardingFollowsCommunityItem,
		AppScrollScroller,
	},
})
export default class FormOnboardingFollows
	extends OnboardingComponent<any>
	implements FormOnLoad, FormOnBeforeSubmit
{
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
