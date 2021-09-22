<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { useFormControlGroup } from '../group/group.vue';
import { provideFormControl } from './controller';

const props = defineProps({
	type: {
		type: String,
		default: 'text',
	},
	validateOn: {
		type: Array as PropType<string[]>,
		default: () => [],
	},
	validateDelay: {
		type: Number,
		default: 0,
	},
	mask: {
		type: Array as PropType<(string | RegExp)[]>,
		default: () => [],
	},
	disabled: {
		type: Boolean,
	},
	htmlListId: {
		type: String,
		default: undefined,
	},
});

// TODO(vue3): can we do the text masking in a way that tree shakes it away when not used?
// TODO(vue3): validation as composition somehow

const root = ref<HTMLInputElement>();
const group = useFormControlGroup()!;

const c = provideFormControl('');

const controlType = computed(() => {
	return props.type === 'currency' ? 'number' : props.type;
});

function onChange() {
	c.applyValue(root.value?.value ?? '');
}

// @Options({})
// export default class AppFormControl extends BaseFormControl {
// 	@Prop({ type: String, default: 'text' })
// 	type!: string;

// 	@Prop(Array) validateOn!: string[];
// 	@Prop(Number) validateDelay!: number;
// 	@Prop(Array) mask!: (string | RegExp)[];
// 	@Prop(propOptional(Boolean, false)) disabled!: boolean;
// 	@Prop(propOptional(String, undefined)) htmlListId!: string;

// 	controlVal = '';
// 	maskedInputElem: any = null;

// 	declare $el: HTMLInputElement;

// 	get controlType() {
// 		if (this.type === 'currency') {
// 			return 'number';
// 		}
// 		return this.type;
// 	}

// 	get validationRules() {
// 		const rules = {
// 			...this.baseRules,
// 		};

// 		if (this.type === 'currency') {
// 			rules.decimal = 2;
// 		}

// 		if (this.type === 'email') {
// 			rules.email = true;
// 		}

// 		return rules;
// 	}

// 	mounted() {
// 		const mask = this.mask;
// 		if (mask) {
// 			this.maskedInputElem = createTextMaskInputElement({
// 				inputElement: this.$el,
// 				mask,
// 			});
// 			this.maskedInputElem.update(this.controlVal);
// 		}
// 	}

// 	onChange() {
// 		if (this.maskedInputElem) {
// 			this.maskedInputElem.update(this.$el.value);
// 		}

// 		this.applyValue(this.$el.value);
// 	}
// }
</script>

<template>
	<!-- v-validate="{ rules: validationRules }"
	:data-vv-validate-on="validateOn"
	:data-vv-delay="validateDelay" -->
	<input
		:id="c.id"
		ref="root"
		:name="group.name"
		class="form-control"
		:type="controlType"
		:value="c.controlVal"
		:disabled="disabled"
		:list="htmlListId"
		@input="onChange"
	/>
</template>
