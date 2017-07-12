import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./name.html';
import { Helpers } from './managed-account';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({})
export class FormFinancialsManagedAccountName extends BaseForm<any> {
	@Prop([Boolean])
	forceRequired: boolean;

	@Prop([String])
	namePrefix: string;

	@Prop([Object])
	helpers: Helpers;
}
