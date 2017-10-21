import { Component } from 'vue-property-decorator';
import View from '!view!./business.html';
import { FormFinancialsManagedAccount } from './managed-account';
import { CommonFormComponents } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import Vue from 'vue';

@View
@Component({
	components: {
		...CommonFormComponents,
	},
})
export class AppFinancialsManagedAccountBusiness extends Vue {
	parent: FormFinancialsManagedAccount = null as any;

	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);
	}
}
