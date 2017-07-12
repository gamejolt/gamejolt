import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./business.html';
import { Helpers } from './managed-account';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({})
export class FormFinancialsManagedAccountBusiness extends BaseForm<any> {
	@Prop([Object])
	helpers: Helpers;
}
