import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./name.html';
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
export class AppFinancialsManagedAccountName extends Vue {
	@Prop(Boolean) forceRequired: boolean;

	@Prop(String) namePrefix: string;

	parent: FormFinancialsManagedAccount = null as any;
	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);
	}
}
