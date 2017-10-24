import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./ssn.html';
import { CommonFormComponents } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { FormFinancialsManagedAccount } from './managed-account';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import Vue from 'vue';

@View
@Component({
	components: {
		...CommonFormComponents,
	},
})
export class AppFinancialsManagedAccountSsn extends Vue {
	@Prop(Boolean) isForceRequired: boolean;

	@Prop(String) namePrefix: string;

	@Prop(String) countryCode: string;

	parent: FormFinancialsManagedAccount = null as any;
	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);
	}
}
