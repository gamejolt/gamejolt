import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./ssn.html';
import { Helpers } from './managed-account';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({})
export class FormFinancialsManagedAccountSsn extends BaseForm<any> {
	@Prop(Boolean) isForceRequired: boolean;

	@Prop(String) namePrefix: string;

	@Prop(String) countryCode: string;

	@Prop(Object) helpers: Helpers;
}
