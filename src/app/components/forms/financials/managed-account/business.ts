import { CommonFormComponents } from '../../../../../_common/form-vue/form.service';
import { findRequiredVueParent } from '../../../../../utils/vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Component({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountBusiness extends Vue {
	parent: FormFinancialsManagedAccountTS = null as any;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}
}
