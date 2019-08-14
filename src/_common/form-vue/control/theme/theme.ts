import { Sketch } from 'vue-color';
import { Component } from 'vue-property-decorator';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import { Api } from '../../../api/api.service';
import AppButton from '../../../button/button.vue';
import AppPopper from '../../../popper/popper.vue';
import AppThemeBubble from '../../../theme/bubble/bubble.vue';
import { ThemePreset } from '../../../theme/preset/preset.model';
import { makeThemeFromColor, makeThemeFromPreset, Theme } from '../../../theme/theme.model';
import { AppTooltip } from '../../../tooltip/tooltip';
import BaseFormControl from '../base';

interface VueColor {
	hex: string | null;
}

@Component({
	components: {
		AppLoading,
		AppThemeBubble,
		AppPopper,
		AppButton,
		picker: Sketch,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFormControlTheme extends BaseFormControl {
	controlVal: Theme | null = null;
	presets: ThemePreset[] = [];
	activeTab: 'preset' | 'custom' = 'preset';
	customSelection: VueColor = { hex: null };

	get currentTheme() {
		return this.controlVal || new Theme();
	}

	get highlight() {
		return this.controlVal && (this.controlVal.custom || this.controlVal.highlight);
	}

	get backlight() {
		if (this.controlVal) {
			// Don't show backlight when a custom color is chosen.
			return this.controlVal.custom ? null : this.controlVal.backlight;
		}
		return null;
	}

	async onPopover() {
		this.activeTab = this.currentTheme.custom ? 'custom' : 'preset';
		this.customSelection.hex = this.currentTheme.custom || null;

		if (this.presets.length) {
			return;
		}

		const response = await Api.sendRequest('/web/theme-presets');
		this.presets = ThemePreset.populate(response.presets);
	}

	selectPreset(preset: ThemePreset) {
		this.applyValue(makeThemeFromPreset(preset));
	}

	isPresetActive(preset: ThemePreset) {
		if (this.currentTheme.custom) {
			return false;
		}

		return this.currentTheme.theme_preset_id === preset.id;
	}

	onCustomChange(colors: VueColor) {
		this.applyValue(makeThemeFromColor((colors.hex || '').substr(1)));
	}

	clear() {
		this.applyValue(null);
	}
}
