import { reactive, Ref } from '@vue/reactivity';
import { onMounted, onUnmounted, PropType, provide } from '@vue/runtime-core';
import { computed, inject, nextTick, ref } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { useRouter } from 'vue-router';
import { arrayRemove, arrayUnique } from '../../utils/array';
import { Api } from '../api/api.service';
import { PayloadFormErrors } from '../payload/payload-service';
import { Translate } from '../translate/translate.service';
import AppFormButton from './button/button.vue';
import AppFormControlError from './control-errors/control-error.vue';
import AppFormControlErrors from './control-errors/control-errors.vue';
import AppFormControlCheckbox from './control/checkbox/checkbox.vue';
import AppFormControl from './control/control.vue';
import { FormControlController } from './control/controller';
import AppFormControlPrefixedInput from './control/prefixed-input/prefixed-input.vue';
import AppFormControlRadio from './control/radio/radio.vue';
import AppFormControlSelect from './control/select/select.vue';
import AppFormControlTextarea from './control/textarea/textarea.vue';
import AppForm from './form.vue';
import AppFormGroup from './group/group.vue';

/**
 * Helper type that looks like our model classes.
 */
type ModelClassType<T> = { new (data?: T): T };

export interface FormController<T = any> {
	name: string;
	formModel: T;
	method: 'add' | 'edit';
	changed: boolean;
	attemptedSubmit: boolean;
	hasFormErrors: boolean;
	isLoaded: boolean | null;
	isLoadedBootstrapped: boolean | null;
	state: {
		isProcessing: boolean;
	};
	serverErrors: PayloadFormErrors;
	customErrors: string[];
	readonly valid: boolean;
	readonly hasErrors: boolean;
	submit: () => Promise<boolean>;
	setField: <K extends keyof T>(key: K, value: T[K]) => void;
	clearErrors: () => void;
	setCustomError: (error: string) => void;
	clearCustomError: (error: string) => void;
	hasCustomError: (error: string) => void;

	// Internal.
	_controls: FormControlController[];
	_emitChanged: () => void;
}

const Key = Symbol('form');

export function defineFormProps<T>() {
	return {
		model: {
			type: Object as PropType<T | undefined>,
			default: () => undefined,
		},
	};
}

export function defineFormEmits<T>() {
	return {
		submit: (_formModel: Readonly<T>, _response: any) => true,
	};
}

export function provideForm<T>(
	name: string,
	model: Ref<T | undefined>,
	{
		modelClass,
		saveMethod,
		loadUrl,
		loadData,
		resetOnSubmit = false,
		warnOnDiscard = true,
		onInit,
		onLoad,
		onBeforeSubmit,
		onSubmit,
		onSubmitSuccess,
		onSubmitError,
		onChange,
	}: {
		modelClass?: ModelClassType<T>;
		saveMethod?: keyof T;
		loadUrl?: string;
		loadData?: any;
		resetOnSubmit?: boolean;
		warnOnDiscard?: boolean;
		onInit?: () => void;
		onLoad?: (response: any) => void;
		onBeforeSubmit?: () => void;
		onSubmit?: () => Promise<any>;
		onSubmitSuccess?: (response: any) => void;
		onSubmitError?: (response: any) => void;
		onChange?: (formModel: any) => void;
	} = {}
) {
	const router = useRouter();

	const formModel = ref(_makeFormModel() as T);
	const method = ref(model.value ? 'edit' : 'add');
	const changed = ref(false);
	const attemptedSubmit = ref(false);
	const hasFormErrors = ref(false);
	const isLoaded = ref(null as null | boolean);
	const isLoadedBootstrapped = ref(null as null | boolean);
	const isProcessing = ref(false);
	const serverErrors = ref({} as PayloadFormErrors);
	const customErrors = ref([] as string[]);
	const _controls = ref([] as FormControlController[]);

	const valid = computed(() => {
		return hasFormErrors.value && customErrors.value.length === 0;
	});

	const hasErrors = computed(() => {
		return false;

		// let hasErrors = false;

		// this.controls.forEach(control => {
		// 	if (control.$validator.getErrors().count() > 0) {
		// 		hasErrors = true;
		// 	}
		// });

		// return hasErrors;
	});

	// @Watch('hasErrors')
	// onHasErrorsChange(hasErrors: boolean) {
	// 	this.base.hasFormErrors = hasErrors;
	// }

	_init();

	// successClearTimeout?: NodeJS.Timer;

	let _routeChangeDeregister: () => void | undefined;
	onMounted(() => {
		if (!warnOnDiscard) {
			return;
		}

		_routeChangeDeregister = router.beforeEach((_to, _from, next) => {
			if (c.changed) {
				if (
					!window.confirm(
						Translate.$gettext(`Are you sure you want to discard your unsaved changes?`)
					)
				) {
					return next(false);
				}
			}

			next();
		});
	});

	onUnmounted(() => {
		_routeChangeDeregister?.();
	});

	function _makeFormModel() {
		// If a model class was assigned to this form, then create a copy of it
		// on the instance. Otherwise just copy the object.
		if (model.value) {
			if (modelClass) {
				return new modelClass(model.value);
			} else {
				return Object.assign({}, model.value);
			}
		} else {
			if (modelClass) {
				return new modelClass();
			} else {
				return {} as T;
			}
		}
	}

	function _init() {
		onInit?.();

		// Reset again in case [onInit] triggered changes.
		changed.value = false;

		_load();
	}

	async function _load() {
		if (isLoaded.value && !resetOnSubmit) {
			return;
		}

		isLoaded.value = null;
		if (!loadUrl) {
			return;
		}

		isLoaded.value = false;

		const payload = await Api.sendRequest(loadUrl, loadData || undefined, {
			detach: true,
		});

		isLoaded.value = true;
		isLoadedBootstrapped.value = true;
		onLoad?.(payload);
	}

	/**
	 * When setting form model field values we need to make sure Vue knows that
	 * the field has changed. This ensures that we always let Vue know any time
	 * we change a field.
	 *
	 * @deprecated vue3 uses proxies and this is no longer needed
	 */
	function setField<K extends keyof T>(key: K, value: T[K]) {
		(formModel.value as any)[key] = value;
	}

	function clearErrors() {
		// TODO(vue3)
		// for (const control of this.controls) {
		// 	control.$validator.errorBag.clear();
		// }
	}

	function setCustomError(error: string) {
		customErrors.value = arrayUnique([...customErrors.value, error]);
	}

	function clearCustomError(error: string) {
		arrayRemove(customErrors.value, i => i === error);
	}

	function hasCustomError(error: string) {
		return customErrors.value.indexOf(error) !== -1;
	}

	async function validate() {
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

	function _emitChanged() {
		changed.value = true;
		onChange?.(formModel.value);
	}

	async function submit() {
		attemptedSubmit.value = true;

		// Wait until all form controls have settled into their final values.
		await nextTick();

		// Gotta validate all controls first.
		await validate();

		// If we have validation errors, don't let it pass through.
		if (!valid.value) {
			return false;
		}

		if (isProcessing.value) {
			return false;
		}
		isProcessing.value = true;

		let response: any;
		try {
			onBeforeSubmit?.();

			if (onSubmit) {
				const _response = await onSubmit();
				if (_response.success === false) {
					throw _response;
				}

				response = _response;
			} else if (modelClass) {
				response = await (formModel.value as any)[saveMethod ?? '$save']();

				// Copy it back to the base model.
				if (model.value) {
					Object.assign(model.value, formModel.value);
				}
			}

			onSubmitSuccess?.(response);

			// Reset our state.
			isProcessing.value = false;
			changed.value = false;
			attemptedSubmit.value = false;
			serverErrors.value = {};

			// Send the new model back into the submit handler.
			this.emitSubmit(formModel.value, response);

			// If we should reset on successful submit, let's do that now.
			if (resetOnSubmit) {
				_init();
			}

			return true;
		} catch (errorResponse) {
			console.error('Form error', errorResponse);

			// Store the server validation errors.
			if (errorResponse && errorResponse.errors) {
				serverErrors.value = errorResponse.errors;
			}

			onSubmitError?.(errorResponse);

			// Reset our processing state.
			isProcessing.value = false;
			return false;
		}
	}

	const c = reactive({
		name,
		formModel,
		method,
		changed,
		attemptedSubmit,
		hasFormErrors,
		isLoaded,
		isLoadedBootstrapped,
		// This state object is to match previous API.
		state: {
			isProcessing,
		},
		serverErrors,
		customErrors,
		valid,
		hasErrors,
		submit,
		setField,
		clearErrors,
		setCustomError,
		clearCustomError,
		hasCustomError,

		_controls,
		_emitChanged,
	}) as FormController<T>;

	provide(Key, c);
	return c;
}

export function useForm<T>() {
	return inject(Key) as FormController<T>;
}

export interface FormOnInit {
	onInit(): void;
}

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

export const CommonFormComponents = {
	AppForm,
	AppFormControl,
	AppFormControlSelect,
	AppFormControlTextarea,
	AppFormControlRadio,
	AppFormControlCheckbox,
	AppFormControlPrefixedInput,
	AppFormGroup,
	AppFormControlErrors,
	AppFormControlError,
	AppFormButton,
};

@Options({
	components: {
		...CommonFormComponents,
	},
})
export class BaseForm<T> extends Vue {
	@Prop({ type: Object, required: false })
	model?: Readonly<T>;

	formModel: Readonly<T> = {} as T;
	modelClass?: { new (data?: T): T } = undefined;
	resetOnSubmit = false;
	warnOnDiscard = true;
	saveMethod?: keyof T;
	method: 'add' | 'edit' = 'add';
	changed = false;
	attemptedSubmit = false;
	hasFormErrors = false;

	// These get overriden as getters in the child classes.
	readonly loadData: any | null;
	isLoaded: boolean | null = null;
	isLoadedBootstrapped: boolean | null = null;
	reloadOnSubmit = false;

	private changeDeregister?: Function;

	state = {
		isProcessing: false,
		isShowingSuccess: false,
	};

	successClearTimeout?: NodeJS.Timer;
	serverErrors: PayloadFormErrors = {};
	private customErrors: string[] = [];

	@Emit('submit')
	emitSubmit(_formModel: Readonly<T>, _response: any) {}

	get loadUrl(): null | string {
		return null;
	}

	get valid() {
		return !this.hasFormErrors && this.customErrors.length === 0;
	}

	created() {
		this.privateInit();
	}

	mounted() {
		if (!this.warnOnDiscard) {
			return;
		}

		this.changeDeregister = this.$router.beforeEach((_to, _from, next) => {
			if (this.changed) {
				if (
					!window.confirm(
						this.$gettext(`Are you sure you want to discard your unsaved changes?`)
					)
				) {
					return next(false);
				}
			}
			next();
		});
	}

	unmounted() {
		if (this.changeDeregister) {
			this.changeDeregister();
			this.changeDeregister = undefined;
		}
	}

	private privateInit() {
		// Is a base model defined? If so, then we're editing.
		if (this.model) {
			this.method = 'edit';

			// If a model class was assigned to this form, then create a copy of
			// it on the instance. Otherwise just copy the object.
			if (this.modelClass) {
				this.formModel = new this.modelClass(this.model);
			} else {
				this.formModel = Object.assign({}, this.model);
			}
		} else {
			// If we have a model class, then create a new one.
			if (this.modelClass) {
				this.formModel = new this.modelClass();
			} else {
				// Otherwise, just use an empty object as the form's model.
				this.formModel = {} as T;
			}
		}

		// This is the main way for forms to initialize.
		if ((this as any).onInit) {
			(this as any).onInit();
		}

		this._load();
	}

	private async _load() {
		if (this.isLoaded && !this.reloadOnSubmit) {
			return;
		}

		this.isLoaded = null;
		if (!this.loadUrl) {
			return;
		}

		this.isLoaded = false;

		const payload = await Api.sendRequest(this.loadUrl, this.loadData || undefined, {
			detach: true,
		});

		this.isLoaded = true;
		this.isLoadedBootstrapped = true;
		if ((this as any).onLoad) {
			(this as any).onLoad(payload);
		}
	}

	/**
	 * When setting form model field values we need to make sure Vue knows that
	 * the field has changed. This ensures that we always let Vue know any time
	 * we change a field.
	 */
	setField<K extends keyof T>(key: K, value: T[K]) {
		(this.formModel as any)[key] = value;
	}

	setCustomError(error: string) {
		this.customErrors.push(error);
		this.customErrors = arrayUnique(this.customErrors);
	}

	clearCustomError(error: string) {
		arrayRemove(this.customErrors, i => i === error);
	}

	hasCustomError(error: string) {
		return this.customErrors.indexOf(error) !== -1;
	}

	async _onSubmit() {
		if (this.state.isProcessing) {
			return false;
		}

		this.state.isProcessing = true;

		let response: any;

		try {
			if ((this as any).onBeforeSubmit) {
				(this as any).onBeforeSubmit();
			}

			if ((this as any).onSubmit) {
				const _response = await (this as any).onSubmit();
				if (_response.success === false) {
					throw _response;
				}

				response = _response;
			} else if (this.modelClass) {
				response = await (this.formModel as any)[this.saveMethod || '$save']();

				// Copy it back to the base model.
				if (this.model) {
					Object.assign(this.model, this.formModel);
				}
			}

			if ((this as any).onSubmitSuccess) {
				(this as any).onSubmitSuccess(response);
			}

			// Reset our state.
			this.state.isProcessing = false;
			this.changed = false;
			this.attemptedSubmit = false;
			this.serverErrors = {};

			// Show successful form submission.
			this._showSuccess();

			// Send the new model back into the submit handler.
			this.emitSubmit(this.formModel, response);

			// If we should reset on successful submit, let's do that now.
			if (this.resetOnSubmit) {
				this.privateInit();

				// Reset again in case init triggered changes.
				this.changed = false;
			}

			return true;
		} catch (_response) {
			console.error('Form error', _response);

			// Store the server validation errors.
			if (_response && _response.errors) {
				this.serverErrors = _response.errors;
			}

			if ((this as any).onSubmitError) {
				(this as any).onSubmitError(_response);
			}

			// Reset our processing state.
			this.state.isProcessing = false;
			return false;
		}
	}

	private _showSuccess() {
		// Reset the timeout if it's already showing.
		if (this.successClearTimeout) {
			clearTimeout(this.successClearTimeout);
		}

		this.state.isShowingSuccess = true;

		this.successClearTimeout = setTimeout(() => {
			this.state.isShowingSuccess = false;
			this.successClearTimeout = undefined;
		}, 2000);
	}
}
