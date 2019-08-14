import { CommonFormComponents } from '../../../../../_common/form-vue/form.service';
import { findRequiredVueParent } from '../../../../../utils/vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import {
	default as FormFinancialsManagedAccount,
	default as FormFinancialsManagedAccountTS,
} from './managed-account.vue';

@Component({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountName extends Vue {
	@Prop(Boolean) forceRequired!: boolean;

	@Prop(String) namePrefix!: string;

	parent: FormFinancialsManagedAccountTS = null as any;
	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}
}
