import {
	Component,
	Input,
	Output,
	Inject,
	SkipSelf,
	Optional,
	EventEmitter,
} from 'ng-metadata/core';
import { FormDashboardGameWizard } from './wizard-service';
import * as template from '!html-loader!./wizard-controls.html';

@Component({
	selector: 'gj-form-dashboard-game-wizard-controls',
	template,
})
export class WizardControlsComponent {
	@Input('<') canProceed: boolean;
	@Input('<') game: any;

	@Output() private onNext = new EventEmitter<void>();

	inForm: boolean;

	constructor(
		@Inject('gjForm')
		@SkipSelf()
		@Optional()
		private gjForm: any,
		@Inject('FormDashboardGameWizard') private wizard: FormDashboardGameWizard,
	) {
		this.inForm = !!this.gjForm;
	}

	next() {
		// Can only automatically do it if no need to submit the form.
		// Otherwise we need to tell the form to submit and the controller has to handle.
		if (!this.inForm) {
			this.wizard.goNext(this.game);
		} else {
			this.onNext.emit(undefined);
		}
	}
}
