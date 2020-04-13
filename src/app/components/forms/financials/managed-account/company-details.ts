import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form.service';
import AppFinancialsManagedAccountAddress from './address.vue';
import AppFinancialsManagedAccountBusiness from './business.vue';
import AppFinancialsManagedAccountContact from './contact.vue';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Component({
	components: {
		...CommonFormComponents,
		AppFinancialsManagedAccountBusiness,
		AppFinancialsManagedAccountAddress,
		AppFinancialsManagedAccountContact,
	},
})
export default class AppFinancialsManagedAccountCompanyDetails extends Vue {
	parent: FormFinancialsManagedAccountTS = null as any;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}
}
