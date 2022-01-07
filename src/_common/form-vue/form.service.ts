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

	private form_: null | FormController<T> = null;

	// We make sure the getters below have fallbacks for when the form isn't
	// constructed yet. This happens when the child class calls these parent
	// getters within their own getter functions.

	get form() {
		// This is what the base classes will call into, so we make this always available.
		return this.form_!;
	}

	get method() {
		return this.form_?.method ?? 'add';
	}

	get changed() {
		return this.form_?.changed ?? false;
	}

	get isLoaded() {
		return this.form_?.isLoaded ?? false;
	}

	get serverErrors() {
		return this.form_?.serverErrors ?? {};
	}

	get loadUrl(): undefined | string {
		return undefined;
	}

	get loadData(): any {
		return undefined;
	}

	get formModel() {
		return (this.form_?.formModel ?? {}) as Readonly<T>;
	}

	get valid() {
		return this.form_?.valid ?? true;
	}

	created() {
		this.form_ = createForm<T>({
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
				this.emitSubmit(this.form_!.formModel, response);
			},
		});
	}

	onInit() {}

	/**
	 * We used to call this to let vue know that a field changed. With vue 3 we
	 * no longer need to do this. Just set the fields directly on the formModel
	 * now.
	 */
	setField<K extends keyof T>(key: K, value: T[K]) {
		if (this.form_?.formModel) {
			this.form_.formModel[key] = value;
		}
	}

	setCustomError(error: string) {
		this.form_?.setCustomError(error);
	}

	clearCustomError(error: string) {
		this.form_?.clearCustomError(error);
	}

	hasCustomError(error: string) {
		return this.form_?.hasCustomError(error) ?? false;
	}
}
