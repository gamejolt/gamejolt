import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent, propOptional, propRequired } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form.service';
import AppFinancialsManagedAccountAddress from './address.vue';
import AppFinancialsManagedAccountContact from './contact.vue';
import AppFinancialsManagedAccountDob from './dob.vue';
import AppFinancialsManagedAccountDocumentTS from './document';
import AppFinancialsManagedAccountDocument from './document.vue';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';
import AppFinancialsManagedAccountName from './name.vue';
import AppFinancialsManagedAccountSsn from './ssn.vue';

@Options({
	components: {
		...CommonFormComponents,
		AppFinancialsManagedAccountName,
		AppFinancialsManagedAccountDob,
		AppFinancialsManagedAccountAddress,
		AppFinancialsManagedAccountContact,
		AppFinancialsManagedAccountSsn,
		AppFinancialsManagedAccountDocument,
	},
})
export default class AppFinancialsManagedAccountPerson extends Vue {
	@Prop(propRequired(String)) namePrefix!: string;

	@Prop(propOptional(String, null)) countryCode!: string | null;

	parent: FormFinancialsManagedAccountTS = null as any;

	declare $refs: {
		'id-document': AppFinancialsManagedAccountDocumentTS;
		'additional-document': AppFinancialsManagedAccountDocumentTS;
	};

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}

	async uploadDocuments(stripePublishableKey: string) {
		let idDocumentRequest: Promise<string> = Promise.resolve('');
		let additionalDocumentRequest: Promise<string> = Promise.resolve('');

		if (this.parent.formModel[`${this.namePrefix}.verification.status`] !== 'verified') {
			if (this.parent.formModel[`${this.namePrefix}.verification.document.front`]) {
				idDocumentRequest = this.$refs['id-document'].uploadDocument(stripePublishableKey);
			}

			if (
				this.parent.formModel[`${this.namePrefix}.verification.additional_document.front`]
			) {
				additionalDocumentRequest =
					this.$refs['additional-document'].uploadDocument(stripePublishableKey);
			}
		}

		return Promise.all([idDocumentRequest, additionalDocumentRequest]);
	}
}
