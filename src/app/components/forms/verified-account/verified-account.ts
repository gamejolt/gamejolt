import {
	BaseForm,
	FormOnInit,
	FormOnSubmitSuccess,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { UserVerificationApplication } from 'game-jolt-frontend-lib/components/user/verification-application/verification-application';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class FormVerifiedAccount extends BaseForm<UserVerificationApplication>
	implements FormOnInit, FormOnSubmitSuccess {
	@Prop(Boolean)
	canSubmit!: boolean;
	@Prop(User)
	user!: User;

	modelClass = UserVerificationApplication;
	existingApplication = false;

	get maxChars() {
		return 250;
	}

	get charactersLeft() {
		if (this.formModel.application) {
			return Math.max(0, this.maxChars - this.formModel.application.length);
		}
		return this.maxChars;
	}

	onInit() {
		if (!this.model) {
			this.setField('application', '');
		} else {
			this.existingApplication = true;
		}
	}

	onSubmitSuccess(response: any) {
		if (response.success) {
			this.existingApplication = true;
			this.model = new UserVerificationApplication(response.application);
		}
	}
}
