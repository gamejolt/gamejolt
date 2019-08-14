import * as VeeValidate from 'vee-validate';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../utils/vue';
import AppLoading from '../../vue/components/loading/loading.vue';
import AppLoadingFade from '../loading/fade/fade.vue';
import BaseFormControl from './control/base';
import { BaseForm } from './form.service';
import { FormValidatorAccept } from './validators/accept';
import { FormValidatorAvailability } from './validators/availability';
import { FormValidatorCcExp } from './validators/cc_exp';
import { FormValidatorCcExpExpired } from './validators/cc_exp_expired';
import { FormValidatorContentNoMediaUpload } from './validators/content_no_media_upload';
import { FormValidatorContentRequired } from './validators/content_required';
import { FormValidatorFilesize } from './validators/filesize';
import { FormValidatorImgDimensions } from './validators/img_dimensions';
import { FormValidatorImgRatio } from './validators/img_ratio';
import { FormValidatorMaxContentLength } from './validators/max_content_length';
import { FormValidatorMaxDate } from './validators/max_date';
import { FormValidatorMaxImgDimensions } from './validators/max_img_dimensions';
import { FormValidatorMaxImgRatio } from './validators/max_img_ratio';
import { FormValidatorMinDate } from './validators/min_date';
import { FormValidatorMinImgDimensions } from './validators/min_img_dimensions';
import { FormValidatorMinImgRatio } from './validators/min_img_ratio';
import { FormValidatorPattern } from './validators/pattern';

Vue.use(VeeValidate);

@Component({
	components: {
		AppLoading,
		AppLoadingFade,
	},
})
export default class AppForm extends Vue {
	@Prop(String) name!: string;

	base!: BaseForm<any>;
	controls: BaseFormControl[] = [];

	private static hasAddedValidators = false;

	get isLoaded() {
		// Check specifically false so that "null" is correctly shown as loaded.
		return this.base.isLoaded !== false;
	}

	get isLoadedBootstrapped() {
		// Check specifically false so that "null" is correctly shown as loaded.
		return this.base.isLoadedBootstrapped !== false;
	}

	get hasErrors() {
		let hasErrors = false;

		this.controls.forEach(control => {
			if (control.$validator.getErrors().count() > 0) {
				hasErrors = true;
			}
		});

		return hasErrors;
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
		if (!AppForm.hasAddedValidators) {
			this.$validator.extend('pattern', FormValidatorPattern);
			this.$validator.extend('availability', FormValidatorAvailability);
			this.$validator.extend('filesize', FormValidatorFilesize);
			this.$validator.extend('accept', FormValidatorAccept);
			this.$validator.extend('img_ratio', FormValidatorImgRatio);
			this.$validator.extend('min_img_ratio', FormValidatorMinImgRatio);
			this.$validator.extend('max_img_ratio', FormValidatorMaxImgRatio);
			this.$validator.extend('img_dimensions', FormValidatorImgDimensions);
			this.$validator.extend('min_img_dimensions', FormValidatorMinImgDimensions);
			this.$validator.extend('max_img_dimensions', FormValidatorMaxImgDimensions);
			this.$validator.extend('cc_exp', FormValidatorCcExp);
			this.$validator.extend('cc_exp_expired', FormValidatorCcExpExpired);
			this.$validator.extend('min_date', FormValidatorMinDate);
			this.$validator.extend('max_date', FormValidatorMaxDate);
			this.$validator.extend('max_content_length', FormValidatorMaxContentLength);
			this.$validator.extend('content_required', FormValidatorContentRequired);
			this.$validator.extend('content_no_media_uploads', FormValidatorContentNoMediaUpload);
			AppForm.hasAddedValidators = true;
		}
	}

	async validate() {
		const promises = this.controls.map(async control => {
			// vee-validate throws an error for failed validation
			try {
				await control.$validator.validateAll();
			} catch (_e) {}
		});

		await Promise.all(promises);
	}

	async submit() {
		this.base.attemptedSubmit = true;

		// Wait until all form controls have settled into their final values.
		await this.$nextTick();

		// Gotta validate all controls first.
		await this.validate();

		// If we have validation errors, don't let it pass through.
		if (!this.base.valid) {
			return false;
		}

		return await this.base._onSubmit();
	}

	clearErrors() {
		for (const control of this.controls) {
			control.$validator.errorBag.clear();
		}
	}

	onChange() {
		this.base.changed = true;
		this.$emit('changed', this.base.formModel);
	}
}
