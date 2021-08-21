import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../utils/vue';
import AppLoadingFade from '../loading/fade/fade.vue';
import AppLoading from '../loading/loading.vue';
import BaseFormControl from './control/controller';
import { BaseForm } from './form.service';

@Options({
	components: {
		AppLoading,
		AppLoadingFade,
	},
})
export default class AppForm extends Vue {
	@Prop({ type: String, required: true })
	name!: string;

	base!: BaseForm<any>;
	controls: BaseFormControl[] = [];

	private static hasAddedValidators = false;

	@Emit('changed')
	emitChanged(_formModel: any) {}

	get isLoaded() {
		// Check specifically false so that "null" is correctly shown as loaded.
		return this.base.isLoaded !== false;
	}

	get isLoadedBootstrapped() {
		// Check specifically false so that "null" is correctly shown as loaded.
		return this.base.isLoadedBootstrapped !== false;
	}

	// TODO(vue3)
	get hasErrors() {
		return false;

		// let hasErrors = false;

		// this.controls.forEach(control => {
		// 	if (control.$validator.getErrors().count() > 0) {
		// 		hasErrors = true;
		// 	}
		// });

		// return hasErrors;
	}

	@Watch('hasErrors')
	onHasErrorsChange(hasErrors: boolean) {
		this.base.hasFormErrors = hasErrors;
	}

	created() {
		this.base = findRequiredVueParent(this, require('./form.service').BaseForm);

		// We gotta make sure that the initial values are correct.
		this.base.hasFormErrors = this.hasErrors;
	}

	mounted() {
		// TODO(vue3)
		// if (!AppForm.hasAddedValidators) {
		// 	this.$validator.extend('pattern', FormValidatorPattern);
		// 	this.$validator.extend('availability', FormValidatorAvailability);
		// 	this.$validator.extend('filesize', FormValidatorFilesize);
		// 	this.$validator.extend('accept', FormValidatorAccept);
		// 	this.$validator.extend('img_ratio', FormValidatorImgRatio);
		// 	this.$validator.extend('min_img_ratio', FormValidatorMinImgRatio);
		// 	this.$validator.extend('max_img_ratio', FormValidatorMaxImgRatio);
		// 	this.$validator.extend('img_dimensions', FormValidatorImgDimensions);
		// 	this.$validator.extend('min_img_dimensions', FormValidatorMinImgDimensions);
		// 	this.$validator.extend('max_img_dimensions', FormValidatorMaxImgDimensions);
		// 	this.$validator.extend('cc_exp', FormValidatorCcExp);
		// 	this.$validator.extend('cc_exp_expired', FormValidatorCcExpExpired);
		// 	this.$validator.extend('min_date', FormValidatorMinDate);
		// 	this.$validator.extend('max_date', FormValidatorMaxDate);
		// 	this.$validator.extend('max_content_length', FormValidatorMaxContentLength);
		// 	this.$validator.extend('content_required', FormValidatorContentRequired);
		// 	this.$validator.extend('content_no_media_uploads', FormValidatorContentNoMediaUpload);
		// 	AppForm.hasAddedValidators = true;
		// }
	}

	async validate() {
		return true;

		// TODO(vue3)
		// const promises = this.controls.map(async control => {
		// 	// vee-validate throws an error for failed validation
		// 	try {
		// 		await control.$validator.validateAll();
		// 	} catch (_e) {}
		// });

		// await Promise.all(promises);
	}

	async submit() {
		this.base.attemptedSubmit = true;

		// Wait until all form controls have settled into their final values.
		await nextTick();

		// Gotta validate all controls first.
		await this.validate();

		// If we have validation errors, don't let it pass through.
		if (!this.base.valid) {
			return false;
		}

		return await this.base._onSubmit();
	}

	clearErrors() {
		// TODO(vue3)
		// for (const control of this.controls) {
		// 	control.$validator.errorBag.clear();
		// }
	}

	onChange() {
		this.base.changed = true;
		this.emitChanged(this.base.formModel);
	}
}
