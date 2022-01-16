import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import { Country, Geo } from '../../../../../_common/geo/geo.service';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountAddress extends Vue {
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