<script lang="ts" setup>
import { PropType, computed, nextTick, ref, toRefs, watch } from 'vue';
import { Api } from '../../api/api.service';
import { $gettext } from '../../translate/translate.service';
import { AppThemeEditorFontSelectorStyleInjector } from './font-selector-style-injector';

interface FontDefinition {
	family: string;
	files: {
		regular: string;
	};
}

const props = defineProps({
	modelValue: {
		type: Object as PropType<FontDefinition>,
		default: undefined,
	},
});

const emit = defineEmits({
	'update:modelValue': (_font?: FontDefinition) => true,
});

const { modelValue } = toRefs(props);

const list = ref<HTMLElement>();
const selectedFont = ref<FontDefinition | null>(null);

const isSelectorShowing = ref(false);
const fontList = ref<FontDefinition[]>([]);
const visibleFontCount = ref(50);
const fontListFilter = ref('');
const fontDefinitions = ref('');
const loadedFonts = ref<string[]>([]);

const fontListFiltered = computed(() => {
	const filter = fontListFilter.value.toLowerCase();
	return (
		fontList.value
			// Filter based on the filter text they enter in.
			.filter(i => i.family.toLowerCase().indexOf(filter) !== -1)
			// Limit to only seeing the number of fonts our current "page" will allow.
			.slice(0, visibleFontCount.value)
	);
});

// Copy to our value when the model changes.
watch(
	() => modelValue?.value,
	() => {
		selectedFont.value = modelValue?.value || null;
		updateFontDefinitions();
	},
	{ immediate: true }
);

async function toggleSelector() {
	isSelectorShowing.value = !isSelectorShowing.value;

	if (!isSelectorShowing.value) {
		fontListFilter.value = '';
		updateFontDefinitions();
		return;
	}

	// On first showing, load the font list.
	if (!fontList.value.length) {
		const newFontList = await getFontList();

		// Store the new font list.
		fontList.value = newFontList;

		// Filter the font list with our current filters.
		updateFontDefinitions();
	}

	await nextTick();

	const liHeight = 38;
	const listHeight = 300;

	list.value?.addEventListener(
		'scroll',
		() => {
			if (!list.value) {
				return;
			}
			const scrollTop = list.value.scrollTop;
			const scrolledItemsCalculated = (scrollTop + listHeight) / liHeight;

			if (visibleFontCount.value - scrolledItemsCalculated < 25) {
				visibleFontCount.value += 50;
				updateFontDefinitions();
			}
		},

		// TODO: Fix once TS has this type def.

		{ passive: true } as any
	);
}

function selectFont(font: FontDefinition) {
	toggleSelector();
	updateValue(font);
}

function clearSelectedFont() {
	updateValue();
}

function updateValue(font?: FontDefinition) {
	emit('update:modelValue', font);
}

async function getFontList(): Promise<FontDefinition[]> {
	const response = await Api.sendRequest('/sites-io/get-font-list', null, {
		detach: true,
		processPayload: false,
	});

	if (response.data && typeof response.data.items !== 'undefined') {
		return response.data.items;
	}

	return [];
}

function makeFontDefinitionString(font: FontDefinition): string {
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

function updateFontDefinitions() {
	const newDefinitions: string[] = [];

	// Make sure our selected font's definition is loaded so it's styled correctly.
	if (selectedFont.value) {
		if (loadedFonts.value.indexOf(selectedFont.value.family) === -1) {
			newDefinitions.push(makeFontDefinitionString(selectedFont.value));
			loadedFonts.value.push(selectedFont.value.family);
		}
	}

	// Loop through our filtered font list and add in any new definitions that need to be loaded.
	if (isSelectorShowing.value) {
		fontListFiltered.value.forEach((font: FontDefinition) => {
			if (loadedFonts.value.indexOf(font.family) === -1) {
				newDefinitions.push(makeFontDefinitionString(font));
				loadedFonts.value.push(font.family);
			}
		});
	}

	fontDefinitions.value += newDefinitions.join('');
}
</script>

<template>
	<div>
		<AppThemeEditorFontSelectorStyleInjector :font-definitions="fontDefinitions" />

		<div class="font-selector" :class="{ 'is-open': isSelectorShowing }">
			<div class="font-selector-selected" @click="toggleSelector()">
				<span v-if="isSelectorShowing" class="font-selector-cancel">
					{{ $gettext(`cancel`) }}
				</span>

				<a
					v-if="!isSelectorShowing && selectedFont"
					class="font-selector-clear"
					@click="clearSelectedFont()"
				>
					{{ $gettext(`clear`) }}
				</a>

				<div v-if="!selectedFont" class="font-selector-selected-label">
					{{ $gettext(`Choose a font...`) }}
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
