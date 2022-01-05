import { computed, toRef } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { ModelClassType } from '../model/model.service';
import { createForm, FormController } from './AppForm.vue';
import { CommonFormComponents } from './form-common';
import {
	validateAvailability,
	validateFilesize,
	validateImageMaxDimensions,
	validateImageMinDimensions,
	validateMaxDate,
	validateMaxLength,
	validateMaxValue,
	validateMinDate,
	validateMinLength,
	validateMinValue,
	validatePattern,
} from './validators';

export interface FormOnBeforeSubmit {
	onBeforeSubmit(): void;
}

export interface FormOnSubmit {
	onSubmit(): Promise<any>;
}

export interface FormOnLoad {
	readonly loadUrl: string;
	readonly loadData?: any;
	onLoad(response: any): void;
}

export interface FormOnSubmitSuccess {
	onSubmitSuccess(response: any): void;
}

export interface FormOnSubmitError {
	onSubmitError(response: any): void;
}

/**
 * This is a wrapper now around a FormController.
 *
 * @deprecated use composition functions instead
 */
@Options({
	components: CommonFormComponents,
})
export class BaseForm<T> extends Vue {
	@Prop({ type: Object, required: false })
	model?: Readonly<T>;

	@Emit('submit')
	emitSubmit(_formModel: Readonly<T>, _response: any) {}

	modelClass?: ModelClassType<T> = undefined;
	saveMethod?: keyof T;

	// Common validators that were used in old form templates.
	readonly validateMaxLength = validateMaxLength;
	readonly validateMinLength = validateMinLength;
	readonly validateMinValue = validateMinValue;
	readonly validateMaxValue = validateMaxValue;
	readonly validateMinDate = validateMinDate;
	readonly validateMaxDate = validateMaxDate;
	readonly validateAvailability = validateAvailability;
	readonly validateFilesize = validateFilesize;
	readonly validateImageMinDimensions = validateImageMinDimensions;
	readonly validateImageMaxDimensions = validateImageMaxDimensions;
	readonly validatePattern = validatePattern;

	form!: FormController<T>;

	get method() {
		return this.form.method;
	}

	get changed() {
		return this.form.changed;
	}

	get isLoaded() {
		return this.form.isLoaded;
	}

	get serverErrors() {
		return this.form.serverErrors;
	}

	get loadUrl(): undefined | string {
		return undefined;
	}

	get loadData(): any {
		return undefined;
	}

	get formModel() {
		return this.form.formModel as Readonly<T>;
	}

	get valid() {
		return this.form.valid;
	}

	created() {
		this.form = createForm<T>({
			model: toRef(this.$props as this, 'model'),
			modelClass: this.modelClass,
			saveMethod: computed(() => this.saveMethod),
			loadUrl: computed(() => (this as Partial<FormOnLoad>).loadUrl),
			loadData: computed(() => (this as Partial<FormOnLoad>).loadData),
			onInit: () => this.onInit(),
			onBeforeSubmit: () => (this as Partial<FormOnBeforeSubmit>).onBeforeSubmit?.(),
			onSubmit: async () => await (this as Partial<FormOnSubmit>).onSubmit?.(),
			onSubmitError: response =>
				(this as Partial<FormOnSubmitError>).onSubmitError?.(response),
			onLoad: response => (this as Partial<FormOnLoad>).onLoad?.(response),
			onSubmitSuccess: response => {
				// We used to set up a submit handler on every form component
				// automatically. This is to reproduce that effect.
				(this as Partial<FormOnSubmitSuccess>).onSubmitSuccess?.(response);
				this.emitSubmit(this.form.formModel, response);
			},
		});
	}

	onInit() {}

	// created() {
	// 	this.privateInit();
	// }

	// mounted() {
	// 	if (!this.warnOnDiscard) {
	// 		return;
	// 	}

	// 	this.changeDeregister = this.$router.beforeEach((_to, _from, next) => {
	// 		if (this.changed) {
	// 			if (
	// 				!window.confirm(
	// 					this.$gettext(`Are you sure you want to discard your unsaved changes?`)
	// 				)
	// 			) {
	// 				return next(false);
	// 			}
	// 		}
	// 		next();
	// 	});
	// }

	// unmounted() {
	// 	if (this.changeDeregister) {
	// 		this.changeDeregister();
	// 		this.changeDeregister = undefined;
	// 	}
	// }

	// private privateInit() {
	// 	// Is a base model defined? If so, then we're editing.
	// 	if (this.model) {
	// 		this.method = 'edit';

	// 		// If a model class was assigned to this form, then create a copy of
	// 		// it on the instance. Otherwise just copy the object.
	// 		if (this.modelClass) {
	// 			this.formModel = new this.modelClass(this.model);
	// 		} else {
	// 			this.formModel = Object.assign({}, this.model);
	// 		}
	// 	} else {
	// 		// If we have a model class, then create a new one.
	// 		if (this.modelClass) {
	// 			this.formModel = new this.modelClass();
	// 		} else {
	// 			// Otherwise, just use an empty object as the form's model.
	// 			this.formModel = {} as T;
	// 		}
	// 	}

	// 	// This is the main way for forms to initialize.
	// 	if ((this as any).onInit) {
	// 		(this as any).onInit();
	// 	}

	// 	this._load();
	// }

	// private async _load() {
	// 	if (this.isLoaded && !this.reloadOnSubmit) {
	// 		return;
	// 	}

	// 	this.isLoaded = null;
	// 	if (!this.loadUrl) {
	// 		return;
	// 	}

	// 	this.isLoaded = false;

	// 	const payload = await Api.sendRequest(this.loadUrl, this.loadData || undefined, {
	// 		detach: true,
	// 	});

	// 	this.isLoaded = true;
	// 	this.isLoadedBootstrapped = true;
	// 	if ((this as any).onLoad) {
	// 		(this as any).onLoad(payload);
	// 	}
	// }

	/**
	 * We used to call this to let vue know that a field changed. With vue 3 we
	 * no longer need to do this. Just set the fields directly on the formModel
	 * now.
	 */
	setField<K extends keyof T>(key: K, value: T[K]) {
		if (this.form.formModel) {
			this.form.formModel[key] = value;
		}
	}

	setCustomError(error: string) {
		this.form.setCustomError(error);
	}

	clearCustomError(error: string) {
		this.form.clearCustomError(error);
	}

	hasCustomError(error: string) {
		return this.form.hasCustomError(error);
	}

	// async _onSubmit() {
	// 	if (this.state.isProcessing) {
	// 		return false;
	// 	}

	// 	this.state.isProcessing = true;

	// 	let response: any;

	// 	try {
	// 		if ((this as any).onBeforeSubmit) {
	// 			(this as any).onBeforeSubmit();
	// 		}

	// 		if ((this as any).onSubmit) {
	// 			const _response = await (this as any).onSubmit();
	// 			if (_response.success === false) {
	// 				throw _response;
	// 			}

	// 			response = _response;
	// 		} else if (this.modelClass) {
	// 			response = await (this.formModel as any)[this.saveMethod || '$save']();

	// 			// Copy it back to the base model.
	// 			if (this.model) {
	// 				Object.assign(this.model, this.formModel);
	// 			}
	// 		}

	// 		if ((this as any).onSubmitSuccess) {
	// 			(this as any).onSubmitSuccess(response);
	// 		}

	// 		// Reset our state.
	// 		this.state.isProcessing = false;
	// 		this.changed = false;
	// 		this.attemptedSubmit = false;
	// 		this.serverErrors = {};

	// 		// Show successful form submission.
	// 		this._showSuccess();

	// 		// Send the new model back into the submit handler.
	// 		this.emitSubmit(this.formModel, response);

	// 		// If we should reset on successful submit, let's do that now.
	// 		if (this.resetOnSubmit) {
	// 			this.privateInit();

	// 			// Reset again in case init triggered changes.
	// 			this.changed = false;
	// 		}

	// 		return true;
	// 	} catch (_response) {
	// 		console.error('Form error', _response);

	// 		// Store the server validation errors.
	// 		if (_response && _response.errors) {
	// 			this.serverErrors = _response.errors;
	// 		}

	// 		if ((this as any).onSubmitError) {
	// 			(this as any).onSubmitError(_response);
	// 		}

	// 		// Reset our processing state.
	// 		this.state.isProcessing = false;
	// 		return false;
	// 	}
	// }

	// private _showSuccess() {
	// 	// Reset the timeout if it's already showing.
	// 	if (this.successClearTimeout) {
	// 		clearTimeout(this.successClearTimeout);
	// 	}

	// 	this.state.isShowingSuccess = true;

	// 	this.successClearTimeout = setTimeout(() => {
	// 		this.state.isShowingSuccess = false;
	// 		this.successClearTimeout = undefined;
	// 	}, 2000);
	// }
}
