<script lang="ts">
import {
	computed,
	inject,
	InjectionKey,
	onUnmounted,
	PropType,
	provide,
	Ref,
	ref,
	shallowRef,
	toRefs,
	useSlots,
} from 'vue';
import { CancelToken } from '../../utils/cancel-token';
import { titleCase } from '../../utils/string';
import { Jolticon } from '../jolticon/AppJolticon.vue';
import { useForm } from './AppForm.vue';
import { FormControlController } from './AppFormControl.vue';
import AppFormControlLabel from './AppFormControlLabel.vue';
import { FormValidatorError } from './validators';

export type FormGroupController = ReturnType<typeof createFormGroup>;

const Key: InjectionKey<FormGroupController> = Symbol('form-control-group');

export function useFormGroup() {
	return inject(Key, null);
}

function createFormGroup({
	name,
	label,
	optional,
}: {
	name: Ref<string>;
	optional: Ref<boolean>;
	label?: Ref<string | undefined>;
}) {
	const form = useForm()!;

	const changed = ref(false);
	const control = shallowRef<FormControlController>();
	const error = ref(null as FormValidatorError | null);

	const invalid = computed(() => error.value !== null);
	const valid = computed(() => !invalid.value);

	const dirty = computed(() => changed.value);
	const pristine = computed(() => !dirty.value);

	const humanLabel = computed(() =>
		!label?.value
			? titleCase(name.value, {
					dropHyphens: true,
					dropUnderscores: true,
					expandCamelCase: true,
					keepLcWords: true,
			  })
			: label.value
	);

	/**
	 * Validate this single control. Calling {@link FormController.validate}
	 * will call this for every field in the form.
	 */
	async function validate(cancelToken: CancelToken) {
		// Only validate if a control has attached to this already.
		if (!control.value) {
			return;
		}

		const { controlVal, validators } = control.value!;

		// console.log('running validators for', name.value);
		for (const validator of validators.value) {
			const result = await validator(controlVal.value);

			// If this validation run is no longer active, ignore the result of
			// this validation and early-out.
			if (cancelToken.isCanceled) {
				return;
			}

			// The first error is the one that gets frozen.
			if (result) {
				error.value = result;
				return;
			}
		}

		error.value = null;
	}

	function clearError() {
		error.value = null;
	}

	const c = {
		changed,
		invalid,
		valid,
		dirty,
		pristine,
		error,
		control,
		name,
		label,
		humanLabel,
		optional,
		validate,
		clearError,
	};

	// Since it's defined as a shallowRef, we need to make sure to modify the
	// instance itself to make sure all the getters rerun.
	form._groups = [...form._groups, c];
	onUnmounted(() => {
		form._groups = form._groups.filter(i => i !== c);
	});

	return c;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		default: undefined,
	},
	optional: {
		type: Boolean,
	},
	hideLabel: {
		type: Boolean,
	},
	labelClass: {
		type: String,
		default: undefined,
	},
	icon: {
		type: String as PropType<Jolticon>,
		default: undefined,
	},
	small: {
		type: Boolean,
	},
	tinyLabelMargin: {
		type: Boolean,
	},
});

const slots = useSlots();

const propsRefs = toRefs(props);
const { labelClass, hideLabel, small } = propsRefs;

const c = createFormGroup(propsRefs);
provide(Key, c);

const { humanLabel } = c;

const hasInlineControl = computed(() => !!slots['inline-control']);
</script>

<template>
	<div class="form-group">
		<template v-if="!hasInlineControl">
			<AppFormControlLabel
				:hide-label="hideLabel"
				:label-class="labelClass"
				:icon="icon"
				:small="small"
				:tiny-label-margin="tinyLabelMargin"
			>
				<slot name="label">{{ humanLabel }}</slot>
			</AppFormControlLabel>
		</template>
		<template v-else>
			<div class="-inline-control-wrapper">
				<AppFormControlLabel
					:hide-label="hideLabel"
					:label-class="labelClass"
					:icon="icon"
					:small="small"
					:tiny-label-margin="tinyLabelMargin"
				>
					<slot name="label">{{ humanLabel }}</slot>
				</AppFormControlLabel>
				<slot name="inline-control" />
			</div>
		</template>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-inline-control-wrapper
	display: flex
	margin-bottom: $form-common-spacing
	justify-content: space-between
	align-items: center

	::v-deep(.control-label)
		margin-bottom: 0
</style>
