import { Options, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

type Palette = {
	label: string;
	colors: string[];
};

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppStyleguideColor extends Vue {
	get palettes(): Palette[] {
		return [
			this.gjColorPalette,
			this.shadesOfGray,
			this.themeShadesOfGray,
			this.themeBaseColors,
			this.themeBackgroundColors,
			this.themeForegroundColors,
			this.themeBiColors,
		];
	}

	get gjColorPalette(): Palette {
		return {
			label: 'GJ Color Palette',
			colors: ['gj-green', 'gj-dark-green', 'gj-pink', 'gj-blue'],
		};
	}

	get shadesOfGray(): Palette {
		return {
			label: 'Shades of Gray',
			colors: [
				'black',
				'gray-darkest',
				'gray-darker',
				'gray-dark',
				'gray',
				'gray-subtle',
				'gray-light',
				'gray-lighter',
				'gray-lightest',
				'white',
			],
		};
	}

	get themeShadesOfGray(): Palette {
		return {
			label: 'Theme Shades of Gray',
			colors: [
				'theme-black',
				'theme-darkest',
				'theme-darker',
				'theme-dark',
				'theme-gray',
				'theme-gray',
				'theme-light',
				'theme-lighter',
				'theme-lightest',
				'theme-white',
			],
		};
	}

	get themeBaseColors(): Palette {
		return {
			label: 'Theme Base Colors',
			colors: [
				'theme-highlight',
				'theme-highlight-fg',
				'theme-backlight',
				'theme-notice',
				'theme-notice-fg',
			],
		};
	}

	get themeBackgroundColors(): Palette {
		return {
			label: 'Theme Background Colors',
			colors: ['theme-bg', 'theme-bg-offset', 'theme-bg-backdrop', 'theme-bg-subtle'],
		};
	}

	get themeForegroundColors(): Palette {
		return {
			label: 'Theme Text / Foreground Colors',
			colors: ['theme-fg', 'theme-fg-muted', 'theme-link', 'theme-link-hover'],
		};
	}

	get themeBiColors(): Palette {
		return {
			label: 'Theme Bi Colors',
			colors: ['theme-bi-fg', 'theme-bi-bg'],
		};
	}
}
