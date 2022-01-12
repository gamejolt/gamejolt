<script lang="ts">
import {
	computed,
	inject,
	InjectionKey,
	nextTick,
	onMounted,
	onUnmounted,
	PropType,
	provide,
	reactive,
	ref,
	Ref,
	toRefs,
} from 'vue';
import { useRouter } from 'vue-router';
import { arrayRemove, arrayUnique } from '../../utils/array';
import { CancelToken } from '../../utils/cancel-token';
import { uuidv4 } from '../../utils/uuid';
import { MaybeRef } from '../../utils/vue';
import { Api } from '../api/api.service';
import AppLoadingFade from '../loading/AppLoadingFade.vue';
import AppLoading from '../loading/loading.vue';
import { ModelClassType } from '../model/model.service';
import { PayloadFormErrors } from '../payload/payload-service';
import { Translate } from '../translate/translate.service';
import { FormGroupController } from './AppFormGroup.vue';

export interface FormController<T = any> {
	name: string;
	formModel: T;
	method: 'add' | 'edit';
	saveMethod: keyof T;
	warnOnDiscard: boolean;
	resetOnSubmit: boolean;
	reloadOnSubmit: boolean;
	changed: boolean;
	attemptedSubmit: boolean;
	isLoaded: boolean | null;
	isLoadedBootstrapped: boolean | null;
	isProcessing: boolean;
	submitted: boolean;
	serverErrors: PayloadFormErrors;
	customErrors: string[];
	validate: () => Promise<void>;
	readonly valid: boolean;
	submit: () => Promise<boolean>;
	clearErrors: () => void;
	setCustomError: (error: string) => void;
	clearCustomError: (error: string) => void;
	hasCustomError: (error: string) => boolean;

	// Internal.
	_groups: FormGroupController[];
	_onControlChanged: () => void;
	_validationToken: null | CancelToken;
	_override: (overrides: Partial<CreateFormOptions<T>>) => void;
}

const Key: InjectionKey<FormController> = Symbol('form');

/**
 * Used to mix in common props used in most forms.
 */
export function defineFormProps<T>() {
	return {
		model: {
			type: Object as PropType<T | undefined>,
			default: () => undefined,
		},
	};
}

export function provideForm(form: FormController) {
	provide(Key, form);
}

export function useForm<T = any>() {
	return inject(Key, null) as FormController<T> | null;
}

interface CreateFormOptions<T> {
	model: Ref<T | undefined>;
	modelClass?: ModelClassType<T>;
	saveMethod?: MaybeRef<keyof T | undefined>;
	loadUrl?: MaybeRef<string | undefined>;
	loadData?: MaybeRef<any>;
	resetOnSubmit?: MaybeRef<boolean>;
	warnOnDiscard?: MaybeRef<boolean>;
	reloadOnSubmit?: MaybeRef<boolean>;
	onInit?: () => void;
	onLoad?: (response: any) => void;
	onBeforeSubmit?: () => void;
	onSubmit?: () => Promise<any>;
	onSubmitSuccess?: (response: any) => void;
	onSubmitError?: (response: any) => void;
	onChange?: (formModel: Readonly<T>) => void;
}

export function createForm<T>({
	model,
	modelClass,
	onInit,
	onLoad,
	onBeforeSubmit,
	onSubmit,
	onSubmitSuccess,
	onSubmitError,
	onChange,
	...options
}: CreateFormOptions<T>) {
	const router = useRouter();

	const name = uuidv4();

	const formModel = ref(_makeFormModel() as T);
	const resetOnSubmit = ref(options.resetOnSubmit || false);
	const warnOnDiscard = ref(options.warnOnDiscard || true);
	const reloadOnSubmit = ref(options.reloadOnSubmit || false);

	// These are only specified as "let" because we need to allow them to be
	// lazy initialized.
	let saveMethod = ref(options.saveMethod);
	let loadUrl = ref(options.loadUrl);
	let loadData = ref(options.loadData);

	const method = ref(model.value ? 'edit' : 'add');
	const changed = ref(false);
	const attemptedSubmit = ref(false);
	const isLoaded = ref(null as null | boolean);
	const isLoadedBootstrapped = ref(null as null | boolean);
	const isProcessing = ref(false);
	const submitted = ref(false);
	const serverErrors = ref({} as PayloadFormErrors);
	const customErrors = ref([] as string[]);
	const _groups = ref([] as FormGroupController[]);
	let _validationToken: null | CancelToken = null;

	const valid = computed(
		() => _groups.value.every(i => i.valid) && customErrors.value.length === 0
	);

	/**
	 * This is purely for {@link BaseForm} to initialize lazily since it doesn't
	 * have access to "this" inside the setup function. Don't ever call this in
	 * your normal forms.
	 */
	function _override(overrides: Partial<CreateFormOptions<T>>) {
		if (overrides.modelClass) {
			modelClass = overrides.modelClass;
		}
		if (overrides.saveMethod) {
			saveMethod = ref(overrides.saveMethod);
		}
		if (overrides.loadUrl) {
			loadUrl = ref(overrides.loadUrl);
		}
		if (overrides.loadData) {
			loadData = ref(overrides.loadData);
		}
		if (overrides.onInit) {
			onInit = overrides.onInit;
		}
		if (overrides.onBeforeSubmit) {
			onBeforeSubmit = overrides.onBeforeSubmit;
		}
		if (overrides.onSubmit) {
			onSubmit = overrides.onSubmit;
		}
		if (overrides.onSubmitError) {
			onSubmitError = overrides.onSubmitError;
		}
		if (overrides.onLoad) {
			onLoad = overrides.onLoad;
		}
		if (overrides.onSubmitSuccess) {
			onSubmitSuccess = overrides.onSubmitSuccess;
		}
		if (overrides.onChange) {
			// Preserve the original onChange and just add to it.
			const _initialOnChange = onChange;
			onChange = formModel => {
				_initialOnChange?.(formModel);
				overrides.onChange?.(formModel);
			};
		}
	}

	let _routeChangeDeregister: () => void | undefined;
	onMounted(() => {
		_init();

		if (!warnOnDiscard.value) {
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
		if (isLoaded.value && !reloadOnSubmit.value) {
			return;
		}

		isLoaded.value = null;
		if (!loadUrl.value) {
			return;
		}

		isLoaded.value = false;

		const payload = await Api.sendRequest(loadUrl.value, loadData.value || undefined, {
			detach: true,
		});

		isLoaded.value = true;
		isLoadedBootstrapped.value = true;
		onLoad?.(payload);
	}

	function clearErrors() {
		// TODO(vue3): test to make sure this works
		for (const group of _groups.value) {
			group.clearError();
		}
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
		_validationToken?.cancel();
		_validationToken = new CancelToken();

		// Simply validate all the controls.
		await Promise.all(_groups.value.map(i => i.validate()));
	}

	function _onControlChanged() {
		changed.value = true;
		onChange?.(formModel.value as T);

		// TODO(vue3): should we validate before calling the onChange or after?
		validate();
	}

	async function submit() {
		attemptedSubmit.value = true;
		submitted.value = false;

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
				response = await (formModel.value as any)[saveMethod.value || '$save']();

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
			submitted.value = true;

			// If we should reset/reload on successful submit, let's do that now.
			if (resetOnSubmit.value || reloadOnSubmit.value) {
				_init();
			}

			return true;
		} catch (errorResponse: any) {
			console.error('Form error', errorResponse);

			// Store the server validation errors.
			if (errorResponse?.errors) {
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
		saveMethod,
		resetOnSubmit,
		warnOnDiscard,
		reloadOnSubmit,
		changed,
		attemptedSubmit,
		isLoaded,
		isLoadedBootstrapped,
		isProcessing,
		submitted,
		serverErrors,
		customErrors,
		validate,
		valid,
		submit,
		clearErrors,
		setCustomError,
		clearCustomError,
		hasCustomError,

		_groups,
		_onControlChanged,
		_validationToken,
		_override,
	}) as FormController<T>;

	return c;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	controller: {
		type: Object as PropType<FormController>,
		required: true,
	},
});

const emit = defineEmits({
	/** @deprecated This is only here for old forms, use the controller's onChange callback instead */
	changed: (_formModel: any) => true,
});

const { controller } = toRefs(props);

controller.value._override({
	onChange: formModel => emit('changed', formModel),
});

provide(Key, controller.value);

// Check specifically false so that "null" is correctly shown as loaded.
const isLoaded = computed(() => controller.value.isLoaded !== false);
const isLoadedBootstrapped = computed(() => controller.value.isLoadedBootstrapped !== false);
</script>

<template>
	<form :name="controller.name" novalidate @submit.prevent="controller.submit">
		<!--
		We show a loader before we load it ever. After the initial load we just
		do the loading fade so that the form doesn't completely disappear when
		loading subsequent.
		-->
		<AppLoading v-if="!isLoadedBootstrapped" />
		<AppLoadingFade v-else :is-loading="!isLoaded">
			<slot />
		</AppLoadingFade>
	</form>
</template>