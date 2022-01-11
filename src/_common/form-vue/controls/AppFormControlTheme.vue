<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { Api } from '../../api/api.service';
import AppLoading from '../../loading/loading.vue';
import AppPopper from '../../popper/popper.vue';
import AppThemeBubble from '../../theme/bubble/bubble.vue';
import { ThemePreset } from '../../theme/preset/preset.model';
import {
	DefaultTheme,
	makeThemeFromColor,
	makeThemeFromPreset,
	Theme,
} from '../../theme/theme.model';
import { AppTooltip as vAppTooltip } from '../../tooltip/tooltip-directive';
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

const c = createFormControl({
	initialValue: null as Theme | null,
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
});

const presets = ref([] as ThemePreset[]);
const activeTab = ref('preset' as 'preset' | 'custom');
const customSelection = ref({ hex: null } as VueColor);

const currentTheme = computed(() => {
	return c.controlVal || DefaultTheme;
});

const highlight = computed(() => {
	return c.controlVal && (c.controlVal.custom || c.controlVal.highlight);
});

const backlight = computed(() => {
	if (c.controlVal) {
		// Don't show backlight when a custom color is chosen.
		return c.controlVal.custom ? null : c.controlVal.backlight;
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
	c.applyValue(makeThemeFromPreset(preset));
}

function isPresetActive(preset: ThemePreset) {
	if (currentTheme.value.custom) {
		return false;
	}

	return currentTheme.value.theme_preset_id === preset.id;
}

function onCustomChange(colors: VueColor) {
	c.applyValue(makeThemeFromColor((colors.hex || '').substr(1)));
}

function clear() {
	c.applyValue(null);
}
</script>

<template>
	<div class="form-control-theme">
		<app-popper @show="onPopover()">
			<a class="-current">
				<app-theme-bubble :highlight="highlight" :backlight="backlight" active />
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
							<app-loading v-if="presets.length === 0" />
							<template v-else>
								<a
									v-for="preset of presets"
									:key="preset.id"
									v-app-tooltip="preset.name"
									class="-preset"
									@click="selectPreset(preset)"
								>
									<app-theme-bubble
										:highlight="preset.highlight"
										:backlight="preset.backlight"
										:active="isPresetActive(preset)"
									/>
								</a>
							</template>
						</div>
						<div v-else-if="activeTab === 'custom'">
							<picker
								disable-alpha
								:preset-colors="[]"
								:value="customSelection"
								@input="onCustomChange"
							/>
							<br />
						</div>

						<app-button v-if="!!c.controlVal" block trans @click="clear()">
							<AppTranslate>Clear Theme</AppTranslate>
						</app-button>
					</div>
				</div>
			</template>
		</app-popper>
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
