import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./id-document.html';
import { FormFinancialsManagedAccount } from './managed-account';
import { CommonFormComponents } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import Vue from 'vue';

@View
@Component({
	components: {
		...CommonFormComponents,
		AppJolticon,
		AppFormControlUpload,
	},
})
export class AppFinancialsManagedAccountIdDocument extends Vue {
	@Prop(String) namePrefix: string;

	parent: FormFinancialsManagedAccount = null as any;
	created() {
		this.parent = findRequiredVueParent(this, FormFinancialsManagedAccount);
	}

	uploadIdDocument(stripePublishableKey: string) {
		return new Promise<any>((resolve, reject) => {
			const formData = new FormData();
			formData.append('purpose', 'identity_document');

			const uploadComponent: AppFormControlUpload = this.$refs['document-input'] as any;
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
