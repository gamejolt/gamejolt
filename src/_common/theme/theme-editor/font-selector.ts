import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Api } from '../../api/api.service';
import { AppThemeEditorFontSelectorStyleInjector } from './font-selector-style-injector';

interface FontDefinition {
	family: string;
	files: {
		regular: string;
	};
}

@Component({
	components: {
		AppThemeEditorFontSelectorStyleInjector,
	},
})
export default class AppThemeEditorFontSelector extends Vue {
	@Prop(Object) value?: FontDefinition;

	$refs!: {
		list: HTMLElement;
	};

	selectedFont: FontDefinition | null = null;

	isSelectorShowing = false;

	fontList: FontDefinition[] = [];
	visibleFontCount = 50;
	fontListFilter = '';

	fontDefinitions = '';
	loadedFonts: string[] = [];

	// Copy to our value when the model changes.
	@Watch('value', { immediate: true })
	onValueChanged() {
		this.selectedFont = this.value || null;
		this.updateFontDefinitions();
	}

	get fontListFiltered() {
		const filter = this.fontListFilter.toLowerCase();
		return (
			this.fontList
				// Filter based on the filter text they enter in.
				.filter(i => i.family.toLowerCase().indexOf(filter) !== -1)
				// Limit to only seeing the number of fonts our current "page" will allow.
				.slice(0, this.visibleFontCount)
		);
	}

	async toggleSelector() {
		this.isSelectorShowing = !this.isSelectorShowing;

		if (!this.isSelectorShowing) {
			this.fontListFilter = '';
			this.updateFontDefinitions();
			return;
		}

		// On first showing, load the font list.
		if (!this.fontList.length) {
			const fontList = await this.getFontList();

			// Store the new font list.
			this.fontList = fontList;

			// Filter the font list with our current filters.
			this.updateFontDefinitions();
		}

		await this.$nextTick();

		const liHeight = 38;
		const listHeight = 300;

		this.$refs.list.addEventListener(
			'scroll',
			() => {
				const scrollTop = this.$refs.list.scrollTop;
				const scrolledItemsCalculated = (scrollTop + listHeight) / liHeight;

				if (this.visibleFontCount - scrolledItemsCalculated < 25) {
					this.visibleFontCount += 50;
					this.updateFontDefinitions();
				}
			},
			// TODO: Fix once TS has this type def.
			{ passive: true } as any
		);
	}

	selectFont(font: FontDefinition) {
		this.toggleSelector();
		this.updateValue(font);
	}

	clearSelectedFont() {
		this.updateValue();
	}

	private updateValue(font?: FontDefinition) {
		this.$emit('input', font);
	}

	private async getFontList(): Promise<FontDefinition[]> {
		const response = await Api.sendRequest('/jams/manage/jams/theme/get-font-list', null, {
			detach: true,
			processPayload: false,
		});

		if (response.data && typeof response.data.items !== 'undefined') {
			return response.data.items;
		}

		return [];
	}

	private makeFontDefinitionString(font: FontDefinition): string {
		// Only support showing regular font styles for now.
		if (font.files.regular) {
			return `@font-face {
				font-family: '${font.family}::Selector';
				font-style: normal;
				font-weight: 400;
				src: url(${font.files.regular}) format('truetype');
			}`.replace(/\t/g, '');
		}

		return '';
	}

	updateFontDefinitions() {
		let newDefinitions: string[] = [];

		// Make sure our selected font's definition is loaded so it's styled correctly.
		if (this.selectedFont) {
			if (this.loadedFonts.indexOf(this.selectedFont.family) === -1) {
				newDefinitions.push(this.makeFontDefinitionString(this.selectedFont));
				this.loadedFonts.push(this.selectedFont.family);
			}
		}

		// Loop through our filtered font list and add in any new definitions that need to be loaded.
		if (this.isSelectorShowing) {
			this.fontListFiltered.forEach((font: FontDefinition) => {
				if (this.loadedFonts.indexOf(font.family) === -1) {
					newDefinitions.push(this.makeFontDefinitionString(font));
					this.loadedFonts.push(font.family);
				}
			});
		}

		this.fontDefinitions += newDefinitions.join('');
	}
}
