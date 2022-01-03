import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import { validatePattern } from '../../../../../_common/form-vue/validators';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountSsn extends Vue {
	@Prop(Boolean) isForceRequired!: boolean;

	@Prop(String) namePrefix!: string;

	@Prop(String) countryCode!: string;

	parent: FormFinancialsManagedAccountTS = null as any;

	readonly validatePattern = validatePattern;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}
}
