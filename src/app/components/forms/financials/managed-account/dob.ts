import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
	},
})
export default class AppFinancialsManagedAccountDob extends Vue {
	@Prop(String) namePrefix!: string;

	days: string[] = [];
	years: string[] = [];

	parent: FormFinancialsManagedAccountTS = null as any;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;

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
