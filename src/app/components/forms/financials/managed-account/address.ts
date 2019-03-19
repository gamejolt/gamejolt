import { CommonFormComponents } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Country, Geo } from 'game-jolt-frontend-lib/components/geo/geo.service';
import { findRequiredVueParent } from 'game-jolt-frontend-lib/utils/vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Component({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountAddress extends Vue {
	@Prop(Boolean) forceRequired!: boolean;

	@Prop(String) namePrefix!: string;

	parent: FormFinancialsManagedAccountTS = null as any;
	countries: Country[] = [];

	Geo = Geo;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
		this.countries = Geo.getCountries();
	}
}
