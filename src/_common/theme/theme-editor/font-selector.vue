<script lang="ts">
import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { AppThemeEditorFontSelectorStyleInjector } from './font-selector-style-injector';

interface FontDefinition {
	family: string;
	files: {
		regular: string;
	};
}

@Options({
	components: {
		AppThemeEditorFontSelectorStyleInjector,
	},
})
export default class AppThemeEditorFontSelector extends Vue {
	@Prop({ type: Object, required: false })
	modelValue?: FontDefinition;

	declare $refs: {
		list: HTMLElement;
	};

	selectedFont: FontDefinition | null = null;

	isSelectorShowing = false;

	fontList: FontDefinition[] = [];
	visibleFontCount = 50;
	fontListFilter = '';

	fontDefinitions = '';
	loadedFonts: string[] = [];

	@Emit('update:modelValue')
	emitUpdate(_font?: FontDefinition) {}

	// Copy to our value when the model changes.
	@Watch('modelValue', { immediate: true })
	onValueChanged() {
		this.selectedFont = this.modelValue || null;
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

		await nextTick();

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
		this.emitUpdate(font);
	}

	private async getFontList(): Promise<FontDefinition[]> {
		const response = await Api.sendRequest('/sites-io/get-font-list', null, {
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
		const newDefinitions: string[] = [];

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
</script>

<template>
	<div>
		<AppThemeEditorFontSelectorStyleInjector :font-definitions="fontDefinitions" />

		<div class="font-selector" :class="{ 'is-open': isSelectorShowing }">
			<div class="font-selector-selected" @click="toggleSelector()">
				<span v-if="isSelectorShowing" class="font-selector-cancel">
					<AppTranslate>cancel</AppTranslate>
				</span>

				<a
					v-if="!isSelectorShowing && selectedFont"
					class="font-selector-clear"
					@click="clearSelectedFont()"
				>
					<AppTranslate>clear</AppTranslate>
				</a>

				<div v-if="!selectedFont" class="font-selector-selected-label">
					<AppTranslate>Choose a font...</AppTranslate>
				</div>
				<div
					v-else
					class="font-selector-selected-label"
					:style="{ 'font-family': `'${selectedFont.family}::Selector'` }"
				>
					{{ selectedFont.family }}
				</div>
			</div>

			<div v-if="isSelectorShowing" class="font-selector-filter">
				<input
					v-model="fontListFilter"
					type="text"
					class="form-control"
					ng-change="updateFontDefinitions()"
					:placeholder="$gettext(`Filter fonts`)"
				/>
			</div>

			<ul v-if="isSelectorShowing" ref="list" class="font-selector-font-list">
				<li
					v-for="font of fontListFiltered"
					:key="font.family"
					class="font-selector-font-list-item"
					:style="{ 'font-family': `'${font.family}::Selector'` }"
					@click="selectFont(font)"
				>
					{{ font.family }}
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.font-selector
	&-font-list
		margin: 0
		padding: 0
		height: 300px
		overflow-y: auto
		overflow-x: hidden

	&-font-list-item
	&-selected
		margin: 0
		padding: 8px 15px
		list-style: none
		cursor: pointer

		&:hover
			change-bg('bg-subtle')
			border-bottom-left-radius: $border-radius-large
			border-bottom-right-radius: $border-radius-large

			.font-selector-cancel
				theme-prop('color', 'link-hover')

	&-cancel
		theme-prop('color', 'fg-muted')
		float: right

	&-clear
		theme-prop('color', 'fg-muted', true)
		float: right

		&:hover
			theme-prop('color', 'link-hover', true)

	&-filter
		change-bg('bg-subtle')
		padding: 10px 15px
</style>
