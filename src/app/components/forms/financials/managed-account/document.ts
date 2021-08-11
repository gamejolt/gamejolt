import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent, propRequired } from '../../../../../utils/vue';
import AppFormControlUploadTS from '../../../../../_common/form-vue/control/upload/upload';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form.service';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
		AppFormControlUpload,
	},
})
export default class AppFinancialsManagedAccountDocument extends Vue {
	@Prop(propRequired(String))
	namePrefix!: string;

	@Prop(propRequired(String))
	type!: 'id' | 'additional';

	parent: FormFinancialsManagedAccountTS = null as any;

	get prefix() {
		return `${this.namePrefix}.${this.type === 'id' ? 'document' : 'additional_document'}`;
	}

	get fieldName() {
		return this.type === 'id' ? this.$gettext('ID Document') : this.$gettext('Utility / Bill');
	}

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}

	/**
	 * Returns the stripe upload id.
	 */
	uploadDocument(stripePublishableKey: string) {
		return new Promise<string>((resolve, reject) => {
			const formData = new FormData();
			formData.append('purpose', 'identity_document');

			const uploadComponent: AppFormControlUploadTS = this.$refs['document-input'] as any;
			formData.append('file', uploadComponent.files[0]!);

			const xhr = new XMLHttpRequest();
			xhr.open('POST', this.parent.StripeFileUploadUrl);
			xhr.setRequestHeader('Authorization', 'Bearer ' + stripePublishableKey);
			xhr.setRequestHeader('Accept', 'application/json'); // Makes sure it doesn't return as JSONP.
			xhr.send(formData);

			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4) {
					return;
				}

				try {
					const data = JSON.parse(xhr.responseText);

					if (xhr.status !== 200) {
						throw new Error(data.error || 'Unknown error');
					}

					if (!data.id) {
						throw new Error(
							`Unexpected response (missing id field): ${xhr.responseText}`
						);
					}

					resolve(data.id);
				} catch (e) {
					reject(e);
				}
			};
		});
	}
}
