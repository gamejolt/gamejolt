import { Emit, mixins, Prop } from 'vue-property-decorator';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import Onboarding, { OnboardingStep } from '../../../../_common/onboarding/onboarding.service';
import { User } from '../../../../_common/user/user.model';

export default abstract class OnboardingComponent
	extends mixins(BaseForm)
	implements FormOnSubmitSuccess
{
	@Prop(User)
	user!: User;

	@Prop(Boolean)
	isSocialRegistration!: boolean;

	startedOn = Date.now();

	@Emit('next')
	emitNext() {}

	abstract get stepName(): OnboardingStep;
	abstract get shouldShowSkip(): boolean;

	get canContinue() {
		return this.valid;
	}

	created() {
		this.form.warnOnDiscard = false;
		Onboarding.startStep(this.stepName);
	}

	onSubmitSuccess() {
		Onboarding.endStep(this.shouldShowSkip);
		this.emitNext();
	}
}
