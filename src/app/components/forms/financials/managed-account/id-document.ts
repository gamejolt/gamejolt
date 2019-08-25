import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import AppFormControlUploadTS from '../../../../../_common/form-vue/control/upload/upload';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form.service';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Component({
	components: {
		...CommonFormComponents,
		AppFormControlUpload,
	},
})
export default class AppFinancialsManagedAccountIdDocument extends Vue {
	@Prop(String) namePrefix!: string;

	parent: FormFinancialsManagedAccountTS = null as any;
	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}

	uploadIdDocument(stripePublishableKey: string) {
		return new Promise<any>((resolve, reject) => {
			const formData = new FormData();
			formData.append('purpose', 'identity_document');

			const uploadComponent: AppFormControlUploadTS = this.$refs['document-input'] as any;
			formData.append('file', uploadComponent.files[0]!);

			const xhr = new XMLHttpRequest();
			xhr.open('POST', this.parent.StripeFileUploadUrl);
			xhr.setRequestHeader('Authorization', 'Bearer ' + stripePublishableKey);
			xhr.setRequestHeader('Accept', 'application/json'); // Makes sure it doesn't return as JSONP.
			xhr.send(formData);

			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject(JSON.parse(xhr.responseText).error);
					}
				}
			};
		});
	}
}
