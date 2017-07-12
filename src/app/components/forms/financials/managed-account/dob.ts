import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./dob.html';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Helpers } from './managed-account';

@View
@Component({})
export class FormFinancialsManagedAccountDob extends BaseForm<any>
	implements FormOnInit {
	@Prop([Boolean])
	forceRequired: boolean;

	@Prop([String])
	namePrefix: string;

	@Prop([Object])
	helpers: Helpers;

	days: string[] = [];
	years: string[] = [];

	onInit() {
		this.days = [];
		for (let i = 1; i <= 31; ++i) {
			this.days.push('' + i);
		}

		this.years = [];
		const maxYear = new Date().getFullYear() - 13;
		for (let i = maxYear; i > maxYear - 100; --i) {
			this.years.push('' + i);
		}
	}
}
