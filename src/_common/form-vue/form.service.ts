import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { arrayRemove, arrayUnique } from '../../utils/array';
import { Api } from '../api/api.service';
import AppFormButton from './button/button.vue';
import { AppFormControlError } from './control-errors/control-error';
import AppFormControlErrors from './control-errors/control-errors.vue';
import AppFormControlCheckbox from './control/checkbox/checkbox.vue';
import AppFormControl from './control/control.vue';
import AppFormControlRadio from './control/radio/radio.vue';
import AppFormControlSelect from './control/select/select.vue';
import AppFormControlTextarea from './control/textarea/textarea.vue';
import AppForm from './form.vue';
import AppFormGroup from './group/group.vue';

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
	AppFormGroup,
	AppFormControlErrors,
	AppFormControlError,
	AppFormButton,
};

@Component({
	components: {
		...CommonFormComponents,
	},
})
export class BaseForm<T> extends Vue {
	@Prop(Object) model?: Readonly<T>;

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
	readonly loadUrl!: string | null;
	readonly loadData: any | null;
	isLoaded: boolean | null = null;
	isLoadedBootstrapped: boolean | null = null;
	reloadOnSubmit = false;

	private changeDeregister?: Function;

	state: { [k: string]: any } = {
		isProcessing: false,
		isShowingSuccess: false,
	};

	successClearTimeout?: NodeJS.Timer;
	serverErrors: { [k: string]: boolean } = {};
	private customErrors: string[] = [];

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

	destroyed() {
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
		Vue.set(this.formModel as any, key as any, value);
	}

	setState(key: string, value: any) {
		Vue.set(this.state, key, value);
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
			this.$emit('submit', this.formModel, response);

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
