import { CommonFormComponents } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { findRequiredVueParent } from 'game-jolt-frontend-lib/utils/vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FormFinancialsManagedAccount from './managed-account.vue';


@Component({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountDob extends Vue {
	@Prop(Boolean) forceRequired!: boolean;

	@Prop(String) namePrefix!: string;

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
