<script lang="ts" setup>
import 'vue-color/style.css';

import { computed, ref, toRef } from 'vue';
import { ChromePicker } from 'vue-color';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { createFormControl, FormControlEmits } from '~common/form-vue/AppFormControl.vue';
import { FormValidator } from '~common/form-vue/validators';
import AppLoading from '~common/loading/AppLoading.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import AppThemeBubble from '~common/theme/bubble/AppThemeBubble.vue';
import { ThemePresetModel } from '~common/theme/preset/preset.model';
import {
	DefaultTheme,
	makeThemeFromColor,
	makeThemeFromPreset,
	ThemeModel,
} from '~common/theme/theme.model';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	disabled?: boolean;
	validators?: FormValidator[];
};
const { validators = [] } = defineProps<Props>();

const emit = defineEmits<FormControlEmits>();

const { controlVal, applyValue } = createFormControl({
	initialValue: null as ThemeModel | null,
	validators: toRef(() => validators),
	onChange: val => emit('changed', val),
	alwaysOptional: true,
});

const presets = ref([] as ThemePresetModel[]);
const activeTab = ref('preset' as 'preset' | 'custom');

const currentTheme = computed(() => controlVal.value || DefaultTheme);

// vue-color@3.3.3 has a bug where passing `{ hex: ... }` as the model value
// causes update events to emit `null` (Ee() returns null for hex-format
// object inputs in vue-color.js:710). Use a bare hex string instead.
const customSelection = computed<string>({
	get: () => (currentTheme.value.custom ? `#${currentTheme.value.custom}` : '#000000'),
	set: val => {
		if (!val) {
			return;
		}
		applyValue(makeThemeFromColor(val.replace(/^#/, '')));
	},
});
const highlight = computed(() => {
	if (!controlVal.value) {
		return undefined;
	}
	return controlVal.value.custom || controlVal.value.highlight;
});

const backlight = computed(() => {
	if (controlVal.value) {
		// Don't show backlight when a custom color is chosen.
		return controlVal.value.custom ? undefined : controlVal.value.backlight;
	}
	return undefined;
});

async function onPopover() {
	activeTab.value = currentTheme.value.custom ? 'custom' : 'preset';

	if (presets.value.length) {
		return;
	}

	const response = await Api.sendRequest('/web/theme-presets');
	presets.value = ThemePresetModel.populate(response.presets);
}

function selectPreset(preset: ThemePresetModel) {
	applyValue(makeThemeFromPreset(preset));
}

function isPresetActive(preset: ThemePresetModel) {
	if (currentTheme.value.custom) {
		return false;
	}

	return currentTheme.value.theme_preset_id === preset.id;
}

function clear() {
	applyValue(null);
}
</script>

<template>
	<div class="form-control-theme">
		<AppPopper @show="onPopover()">
			<a class="-current">
				<AppThemeBubble :highlight :backlight active />
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
										{{ $gettext(`Theme Preset`) }}
									</a>
								</li>
								<li>
									<a
										:class="{ active: activeTab === 'custom' }"
										@click="activeTab = 'custom'"
									>
										{{ $gettext(`Custom Color`) }}
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
							<ChromePicker v-model="customSelection" disable-alpha />
							<br />
						</div>

						<AppButton v-if="!!controlVal" block trans @click="clear()">
							{{ $gettext(`Clear Theme`) }}
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
	::v-deep(.vc-chrome-picker)
		box-shadow: none
		width: 100%
		box-sizing: border-box

	::v-deep(.vc-input-input)
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
