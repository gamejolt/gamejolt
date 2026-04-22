<script lang="ts" setup>
import 'vue-color/style.css';

import { computed, ref, watch } from 'vue';
import { ChromePicker } from 'vue-color';

import AppButton from '~common/button/AppButton.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import { Popper } from '~common/popper/popper.service';
import { $gettext } from '~common/translate/translate.service';

const modelValue = defineModel<string>({ required: true });

// Empty string = "no selection" — the swatch shows a checkerboard.
const colors = ref<string>('');

// The picker itself can't be fed an empty value (vue-color@3.3.3 would
// emit `null` back if the input wasn't a parseable color), so wrap with
// a fallback and ignore null/empty emits.
const pickerValue = computed<string>({
	get: () => colors.value || '#000000',
	set: val => {
		if (val) {
			colors.value = val;
		}
	},
});

watch(
	modelValue,
	() => {
		colors.value = modelValue.value;
	},
	{ immediate: true }
);

function accept() {
	modelValue.value = colors.value;
	Popper.hideAll();
}

function cancel() {
	colors.value = modelValue.value;
	Popper.hideAll();
}
</script>

<template>
	<div class="colorpicker">
		<AppPopper>
			<div
				class="color"
				:class="{ empty: !colors }"
				:style="{
					backgroundColor: colors || undefined,
				}"
			/>

			<template #popover>
				<div class="colorpicker-popover">
					<ChromePicker v-model="pickerValue" />

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
	:deep(.vc-chrome-picker)
		margin-left: auto
		margin-right: auto
		box-shadow: none
</style>
