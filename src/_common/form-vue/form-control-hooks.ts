import { inject, InjectionKey, provide, Ref } from 'vue';

import { FormControlController } from '~common/form-vue/AppFormControl.vue';

const Key: InjectionKey<FormControlHooks> = Symbol('form-control-hooks');

interface FormControlHooks {
	afterMount?: (
		c: FormControlController,
		el: Readonly<Ref<HTMLInputElement | null>>
	) => void;
	beforeApplyValue?: <T>(c: FormControlController, value: T) => T;
}

export function provideFormControlHooks(hooks: FormControlHooks) {
	provide(Key, hooks);
}

export function useFormControlHooks() {
	return inject(Key, null);
}
