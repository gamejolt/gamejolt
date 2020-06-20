import { Component, Watch } from 'vue-property-decorator';
import AppFormControlSelect from '../../form-vue/control/select/select.vue';
import AppFormControlTextarea from '../../form-vue/control/textarea/textarea.vue';
import AppFormControlTheme from '../../form-vue/control/theme/theme.vue';
import { BaseForm } from '../../form-vue/form.service';
import AppForm from '../../form-vue/form.vue';
import AppFormGroup from '../../form-vue/group/group.vue';
import { AppTheme } from '../theme';
import { Theme } from '../theme.model';
import { ThemeState, ThemeStore } from '../theme.store';
import { AppThemeSvg } from './svg';

interface VueColor {
	hex: string | null;
}

const SvgList = [
	require('../../../app/img/game-jolt-logo.svg'),
	require('../../../app/img/game-jolt-client-logo.svg'),
	require('../../../app/img/jolt.svg'),
];

const FillList = [
	'fill-offset',
	'fill-backdrop',
	'fill-bg',
	'fill-highlight',
	'fill-notice',
	'fill-gray',
	'fill-dark',
	'fill-darker',
	'fill-darkest',
	'fill-black',
];

@Component({
	components: {
		AppTheme,
		AppThemeSvg,
		AppForm,
		AppFormGroup,
		AppFormControlSelect,
		AppFormControlTheme,
		AppFormControlTextarea,
	},
})
export default class AppThemeSvgStyleguide extends BaseForm<any> {
	@ThemeState
	theme!: ThemeStore['theme'];

	customSvg = '';
	customSelection: VueColor = { hex: null };

	readonly SvgList = SvgList;
	readonly FillList = FillList;

	get formFile(): string {
		return this.formModel.file || 'custom';
	}

	get formBgColor(): string {
		return this.formModel.color || 'fill-offset';
	}

	get formTheme(): Theme | null {
		return this.formModel.theme || this.theme;
	}

	get formCustomFile(): string {
		return this.formModel.custom || '';
	}

	mounted() {
		// Initialize the form fields
		this.setField('file', this.formFile);
		this.setField('color', this.formBgColor);
		this.setField('theme', this.formTheme);
		this.setField('custom', this.formCustomFile);
	}

	parseSvgName(name: string) {
		try {
			// This will remove '/assets/' and '.X.svg' from list names,
			// leaving the plain filename without the file extension or path.
			return name.split('/assets/')[1].split('.')[0];
		} catch {
			return name;
		}
	}

	@Watch('formCustomFile')
	onCustomSvgChange() {
		// Reset and return if the textarea is empty.
		if (!this.formCustomFile.length) {
			return;
		}

		// Trim the satrt of the SVG string, otherwise we could have issues processing it.
		const svgString = this.formCustomFile.trimStart();

		// Parse the pasted SVG XML into a format that we can pass to AppThemeSvg.
		this.customSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
	}
}
