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
export default class AppFinancialsManagedAccountSsn extends Vue {
	@Prop(Boolean) isForceRequired!: boolean;

	@Prop(String) namePrefix!: string;

	@Prop(String) countryCode!: string;

	parent: FormFinancialsManagedAccount = null as any;
	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);
	}
}
