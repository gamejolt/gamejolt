import { mixins, Options, Watch } from 'vue-property-decorator';
import * as illustrations from '../../../app/img/ill/illustrations';
import { imageGameJoltClientLogo, imageGameJoltLogo, imageJolt } from '../../../app/img/images';
import AppForm from '../../form-vue/AppForm.vue';
import AppFormGroup from '../../form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTextarea from '../../form-vue/controls/AppFormControlTextarea.vue';
import AppFormControlTheme from '../../form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../form-vue/form.service';
import { AppTheme } from '../theme';
import { Theme } from '../theme.model';
import { ThemeState, ThemeStore } from '../theme.store';
import AppThemeSvg from './svg';

interface VueColor {
	hex: string | null;
}

interface FormModel {
	file?: string;
	color?: string;
	theme?: null | Theme;
	custom?: string;
	strictColors?: boolean;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppTheme,
		AppThemeSvg,
		AppForm,
		AppFormGroup,
		AppFormControlSelect,
		AppFormControlToggle,
		AppFormControlTheme,
		AppFormControlTextarea,
	},
})
export default class AppThemeSvgStyleguide extends mixins(Wrapper) {
	@ThemeState('theme')
	storeTheme!: ThemeStore['theme'];

	customSvg = '';
	customSelection: VueColor = { hex: null };

	readonly SvgList = {
		imageGameJoltLogo,
		imageGameJoltClientLogo,
		imageJolt,
		...illustrations,
	};
	readonly FillList = [
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

	get file() {
		return this.formModel.file || 'custom';
	}

	get bgColor() {
		return this.formModel.color || 'fill-offset';
	}

	get theme() {
		return this.formModel.theme || this.storeTheme;
	}

	get customFile() {
		return this.formModel.custom || '';
	}

	get strictColors() {
		return !!this.formModel.strictColors;
	}

	mounted() {
		// Initialize the form fields
		this.setField('file', this.file);
		this.setField('color', this.bgColor);
		this.setField('theme', this.theme);
		this.setField('custom', this.customFile);
		this.setField('strictColors', false);
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

	@Watch('customFile')
	onCustomSvgChange() {
		// Reset and return if the textarea is empty.
		if (!this.customFile.length) {
			return;
		}

		// Trim the start of the SVG string, otherwise we could have issues processing it.
		const svgString = this.customFile.trimLeft();

		// Parse the pasted SVG XML into a format that we can pass to AppThemeSvg.
		this.customSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
	}
}
