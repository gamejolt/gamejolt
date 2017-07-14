import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./dob.html';
import { FormFinancialsManagedAccount } from './managed-account';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { CommonFormComponents } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import Vue from 'vue';

@View
@Component({
	components: {
		...CommonFormComponents,
	},
})
export class AppFinancialsManagedAccountDob extends Vue {
	@Prop(Boolean) forceRequired: boolean;

	@Prop(String) namePrefix: string;

	days: string[] = [];
	years: string[] = [];

	parent: FormFinancialsManagedAccount = null as any;

	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);

		this.days = [];
		for (let i = 1; i <= 31; ++i) {
			this.days.push('' + i);
		}

		this.years = [];
		const maxYear = new Date().getFullYear() - 13;
		for (let i = maxYear; i > maxYear - 100; --i) {
			this.years.push('' + i);
		}
	}
}
