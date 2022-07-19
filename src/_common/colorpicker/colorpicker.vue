<script lang="ts">
import { Sketch as VuePicker } from '@ckpack/vue-color';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppPopper from '../popper/AppPopper.vue';
import { Popper } from '../popper/popper.service';

type VueTouch = {
	hex: string | null;
};

@Options({
	components: {
		VuePicker,
		AppPopper,
	},
})
export default class AppColorpicker extends Vue {
	@Prop({ type: String })
	modelValue?: string;

	colors: VueTouch = {
		hex: null,
	};

	@Emit('update:modelValue')
	emitUpdate(_modelValue: string) {}

	@Watch('modelValue', { immediate: true })
	onValueChanged() {
		this.colors = {
			hex: this.modelValue ?? '',
		};
	}

	onChange(value: VueTouch) {
		this.colors = value;
	}

	accept() {
		this.emitUpdate(this.colors.hex!);
		Popper.hideAll();
	}

	cancel() {
		this.colors = {
			hex: this.modelValue ?? '',
		};
		Popper.hideAll();
	}
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
								<AppTranslate>Accept</AppTranslate>
							</AppButton>
						</div>
						<div class="col">
							<AppButton trans block @click="cancel">
								<AppTranslate>Cancel</AppTranslate>
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
