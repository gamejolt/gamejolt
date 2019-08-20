import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import Onboarding, { OnboardingStep } from '../../../../_common/onboarding/onboarding.service';
import { User } from '../../../../_common/user/user.model';
import { Prop } from 'vue-property-decorator';

export default abstract class OnboardingComponent<T> extends BaseForm<T>
	implements FormOnSubmitSuccess {
	warnOnDiscard = false;

	@Prop(User)
	user!: User;

	@Prop(Boolean)
	isSocialRegistration!: boolean;

	startedOn = Date.now();

	abstract get stepName(): OnboardingStep;

	abstract get shouldShowSkip(): boolean;

	get canContinue() {
		return this.valid;
	}

	created() {
		Onboarding.startStep(this.stepName);
	}

	onSubmitSuccess() {
		Onboarding.endStep(this.shouldShowSkip);
		this.$emit('next');
	}
}
