import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./id-document.html';
import { Helpers } from './managed-account';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppJolticon,
		AppFormControlUpload,
	},
})
export class FormFinancialsManagedAccountIdDocument extends BaseForm<any> {
	@Prop([String])
	namePrefix: string;

	@Prop([Object])
	helpers: Helpers;
}
