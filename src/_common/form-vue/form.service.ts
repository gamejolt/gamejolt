import { computed, toRef } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { ModelClassType } from '../model/model.service';
import { createForm } from './AppForm.vue';
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
	modelSaveHandler?: (model: T) => Promise<any>;

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

	form = setup(() =>
		createForm<T>({
			model: toRef(this.$props as this, 'model'),
		})
	);

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
		return (this.form.formModel ?? {}) as T;
	}

	get valid() {
		return this.form.valid;
	}

	created() {
		this.form._override({
			modelClass: this.modelClass,
			saveMethod: computed(() => this.saveMethod),
			loadUrl: computed(() => (this as Partial<FormOnLoad>).loadUrl),
			loadData: computed(() => (this as Partial<FormOnLoad>).loadData),
			onInit: () => this.onInit(),
			onBeforeSubmit: (this as Partial<FormOnBeforeSubmit>).onBeforeSubmit?.bind(this),
			onSubmit: (this as Partial<FormOnSubmit>).onSubmit?.bind(this),
			onSubmitError: (this as Partial<FormOnSubmitError>).onSubmitError?.bind(this),
			onLoad: (this as Partial<FormOnLoad>).onLoad?.bind(this),
			onSubmitSuccess: response => {
				// We used to set up a submit handler on every form component
				// automatically. This is to reproduce that effect.
				(this as Partial<FormOnSubmitSuccess>).onSubmitSuccess?.(response);
				this.emitSubmit(this.formModel as any, response);
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
		if (this.formModel) {
			this.formModel[key] = value;
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
}
