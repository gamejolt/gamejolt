<script lang="ts" setup>
import { Sketch as VuePicker } from '@ckpack/vue-color';
import { ref, toRefs, watch } from 'vue';
import AppButton from '../button/AppButton.vue';
import AppPopper from '../popper/AppPopper.vue';
import { Popper } from '../popper/popper.service';
import { $gettext } from '../translate/translate.service';

type VueTouch = {
	hex: string | null;
};

const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
});

const emit = defineEmits({
	'update:modelValue': (_modelValue: string) => true,
});

const { modelValue } = toRefs(props);
const colors = ref<VueTouch>({
	hex: null,
});

watch(modelValue, () => {
	colors.value = {
		hex: modelValue?.value ?? '',
	};
});

function onChange(value: VueTouch) {
	colors.value = value;
}

function accept() {
	emit('update:modelValue', colors.value.hex!);
	Popper.hideAll();
}

function cancel() {
	colors.value = {
		hex: modelValue?.value ?? '',
	};
	Popper.hideAll();
}
</script>

<template>
	<div class="colorpicker">
		<AppPopper>
			<div
				class="color"
				:class="{ empty: !colors.hex }"
				:style="{
					'background-color': colors.hex,
				}"
			/>

			<template #popover>
				<div class="colorpicker-popover">
					<!-- eslint-disable-next-line vue/v-on-event-hyphenation -->
					<VuePicker :model-value="colors" @update:modelValue="onChange" />

					<div class="colorpicker-well">
						<div class="col">
							<AppButton primary solid block @click="accept">
								{{ $gettext(`Accept`) }}
							</AppButton>
						</div>
						<div class="col">
							<AppButton trans block @click="cancel">
								{{ $gettext(`Cancel`) }}
							</AppButton>
						</div>
					</div>
				</div>
			</template>
		</AppPopper>
	</div>
</template>

<style lang="stylus" scoped>
.colorpicker
	display: inline-block
	vertical-align: middle

.color
	theme-prop('border-color', 'lighter')
	img-circle()
	display: inline-block
	width: $line-height-computed
	height: $line-height-computed
	border-width: $border-width-base
	border-style: solid
	cursor: pointer

	// Checkerboard pattern
	&.empty
		background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)
		background-size: 10px 10px
		background-position: 0 0, 0 5px, 5px -5px, -5px 0

.colorpicker-well
	clearfix()
	padding: 5px 0

	.col
		float: left
		width: 50%
		padding: 0 5px

.colorpicker-popover
	.vc_sketch
		margin-left: auto
		margin-right: auto

	::v-deep(.vue-color__sketch)
		box-shadow: none
</style>
