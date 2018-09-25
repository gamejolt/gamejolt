import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./address.html';
import { CommonFormComponents } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Geo, Country } from '../../../../../lib/gj-lib-client/components/geo/geo.service';
import { FormFinancialsManagedAccount } from './managed-account';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import Vue from 'vue';

@View
@Component({
	components: {
		...CommonFormComponents,
	},
})
export class AppFinancialsManagedAccountAddress extends Vue {
	@Prop(Boolean) forceRequired!: boolean;

	@Prop(String) namePrefix!: string;

	parent: FormFinancialsManagedAccount = null as any;
	countries: Country[] = [];

	Geo = Geo;

	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);
		this.countries = Geo.getCountries();
	}
}
