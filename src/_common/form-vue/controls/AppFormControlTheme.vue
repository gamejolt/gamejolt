<script lang="ts" setup>
import { Sketch as VuePicker } from '@ckpack/vue-color';
import { computed, ref, toRef } from 'vue';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import AppLoading from '../../loading/loading.vue';
import AppPopper from '../../popper/AppPopper.vue';
import AppThemeBubble from '../../theme/bubble/bubble.vue';
import { ThemePreset } from '../../theme/preset/preset.model';
import {
	DefaultTheme,
	makeThemeFromColor,
	makeThemeFromPreset,
	Theme,
} from '../../theme/theme.model';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppTranslate from '../../translate/AppTranslate.vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';

const props = defineProps({
	...defineFormControlProps(),
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

interface VueColor {
	hex: string | null;
}

const { controlVal, applyValue } = createFormControl({
	initialValue: null as Theme | null,
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	alwaysOptional: true,
});

const presets = ref([] as ThemePreset[]);
const activeTab = ref('preset' as 'preset' | 'custom');
const customSelection = ref({ hex: null } as VueColor);

const currentTheme = computed(() => {
	return controlVal.value || DefaultTheme;
});

const highlight = computed(() => {
	return controlVal.value && (controlVal.value.custom || controlVal.value.highlight);
});

const backlight = computed(() => {
	if (controlVal.value) {
		// Don't show backlight when a custom color is chosen.
		return controlVal.value.custom ? null : controlVal.value.backlight;
	}
	return null;
});

async function onPopover() {
	activeTab.value = currentTheme.value.custom ? 'custom' : 'preset';
	customSelection.value.hex = currentTheme.value.custom || null;

	if (presets.value.length) {
		return;
	}

	const response = await Api.sendRequest('/web/theme-presets');
	presets.value = ThemePreset.populate(response.presets);
}

function selectPreset(preset: ThemePreset) {
	applyValue(makeThemeFromPreset(preset));
}

function isPresetActive(preset: ThemePreset) {
	if (currentTheme.value.custom) {
		return false;
	}

	return currentTheme.value.theme_preset_id === preset.id;
}

function onCustomChange(colors: VueColor) {
	applyValue(makeThemeFromColor((colors.hex || '').substr(1)));
}

function clear() {
	applyValue(null);
}
</script>

<template>
	<div class="form-control-theme">
		<AppPopper @show="onPopover()">
			<a class="-current">
				<AppThemeBubble :highlight="highlight" :backlight="backlight" active />
			</a>

			<template #popover>
				<div class="-popover">
					<div class="well">
						<nav class="platform-list inline nav-justified">
							<ul>
								<li>
									<a
										:class="{ active: activeTab === 'preset' }"
										@click="activeTab = 'preset'"
									>
										<AppTranslate>Theme Preset</AppTranslate>
									</a>
								</li>
								<li>
									<a
										:class="{ active: activeTab === 'custom' }"
										@click="activeTab = 'custom'"
									>
										<AppTranslate>Custom Color</AppTranslate>
									</a>
								</li>
							</ul>
						</nav>

						<div v-if="activeTab === 'preset'" class="-presets">
							<AppLoading v-if="presets.length === 0" />
							<template v-else>
								<a
									v-for="preset of presets"
									:key="preset.id"
									v-app-tooltip="preset.name"
									class="-preset"
									@click="selectPreset(preset)"
								>
									<AppThemeBubble
										:highlight="preset.highlight"
										:backlight="preset.backlight"
										:active="isPresetActive(preset)"
									/>
								</a>
							</template>
						</div>
						<div v-else-if="activeTab === 'custom'">
							<VuePicker
								disable-alpha
								:preset-colors="[]"
								:model-value="customSelection"
								@update:modelValue="onCustomChange"
							/>
							<br />
						</div>

						<AppButton v-if="!!controlVal" block trans @click="clear()">
							<AppTranslate>Clear Theme</AppTranslate>
						</AppButton>
					</div>
				</div>
			</template>
		</AppPopper>
	</div>
</template>

<style lang="stylus" scoped>
.-current
	display: block
	width: $input-height-base

strong
	display: block
	margin-bottom: 10px

@media $media-sm-up
	.-popover
		width: 325px

.-presets
	display: flex
	flex-wrap: wrap
	justify-content: flex-start
	margin: 0 -10px

.-preset
	display: block
	width: (100% / 6)
	padding-left: 10px
	padding-right: 10px
	margin-bottom: $line-height-computed

.-popover
	::v-deep(.vc-sketch)
		box-shadow: none
		width: 100%
		box-sizing: border-box

	::v-deep(.vc-sketch-presets)
		display: none

	::v-deep(.vc-input__input)
		theme-prop('color', 'fg')
		change-bg('bg')
		theme-prop('border-color', 'bg-subtle')
		border-width: 2px
		border-style: solid
		border-radius: $input-border-radius
		box-shadow: none
		transition: border-color ease-in-out 0.15s

		&:focus
			theme-prop('border-color', 'fg-muted')
			box-shadow: none
			outline: 0
</style>
