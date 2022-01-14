<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import AppFormControlUploadTS from '../../../../../_common/form-vue/controls/upload/upload';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import { validateFilesize } from '../../../../../_common/form-vue/validators';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
		AppFormControlUpload,
	},
})
export default class AppFinancialsManagedAccountDocument extends Vue {
	@Prop({ type: String, required: true })
	namePrefix!: string;

	@Prop({ type: String, required: true })
	type!: 'id' | 'additional';

	parent: FormFinancialsManagedAccountTS = null as any;

	readonly validateFilesize = validateFilesize;

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
</script>

<template>
	<div v-if="parent.requiresField(prefix)">
		<!--
			It only has a details_code if it failed to verify.
		-->
		<div
			v-if="
				!parent.getStripeField(prefix + '.front') ||
				parent.getStripeField(prefix + '.details_code')
			"
		>
			<hr />

			<div v-if="parent.getStripeField(prefix + '.details')" class="alert">
				<app-jolticon icon="notice" />
				{{ parent.getStripeField(prefix + '.details') }}
			</div>

			<app-form-group :name="`${prefix}.front`" :label="fieldName">
				<p class="help-block">
					<translate v-if="type === 'id'">
						This should be a scan of an ID card, driver's license, passport, or other
						government supplied identification.
					</translate>
					<translate v-else>
						This should be a scan or photo of a document verifying the address, such as
						a utility bill.
					</translate>
					<em>
						<translate>
							Only .png or .jpg is accepted and it must be smaller than 8MB.
						</translate>
					</em>
				</p>
				<app-form-control-upload
					ref="document-input"
					:validators="[validateFilesize(8 * 1024 * 1024)]"
					accept=".png,.jpg,.jpeg"
				/>
				<app-form-control-errors />
			</app-form-group>
		</div>

		<div
			v-if="
				parent.getStripeField(prefix + '.front') &&
				!parent.getStripeField(prefix + '.details_code')
			"
			class="form-horizontal"
		>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>ID Document</translate>
				</label>
				<div class="form-static col-sm-8">
					<translate>Provided</translate>
				</div>
			</div>
		</div>
	</div>
</template>
