<script lang="ts">
import { parseToRgb, transparentize } from 'polished';
import { PropType, computed, useSlots } from 'vue';
import AppStyle from '../AppStyle.vue';
import { DefaultTheme, ThemeModel } from './theme.model';
import { useThemeStore } from './theme.store';

// This needs to be global so that we can generate an ID for each component.
let _inc = 0;

// Global helpers for generating the style rules.
function genVar(varname: string, value: string, isDark = false) {
	value = '#' + value;
	const rgbValue = parseToRgb(value);
	const dark = isDark ? 'dark-' : '';

	return `
		--${dark}theme-${varname}: ${value};
		--${dark}theme-${varname}-trans: ${transparentize(1, value)};
		--${dark}theme-${varname}-rgb: ${rgbValue.red}, ${rgbValue.green}, ${rgbValue.blue};
	`;
}

function copyVar(varname: string, target: string, isDark = false) {
	const dark = isDark ? 'dark-' : '';

	return `
		--${dark}theme-${varname}: var(--theme-${target});
		--${dark}theme-${varname}-trans: var(--theme-${target}-trans);
		--${dark}theme-${varname}-rgb: var(--theme-${target}-rgb);
	`;
}

function darkVar(varname: string) {
	return `
		--theme-${varname}: var(--dark-theme-${varname});
		--theme-${varname}-trans: var(--dark-theme-${varname}-trans);
		--theme-${varname}-rgb: var(--dark-theme-${varname}-rgb);
	`;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	theme: {
		type: Object as PropType<ThemeModel>,
		default: null,
	},
	forceDark: {
		type: Boolean,
	},
	forceLight: {
		type: Boolean,
	},
});

const slots = useSlots();
const { theme: storeTheme, isDark } = useThemeStore();

// Not reactive on purpose.
const scopeId = ++_inc;
const id = 'theme-' + scopeId;
const selector = slots.default ? '#' + id : ':root';
const theme = computed(() => props.theme ?? storeTheme.value ?? DefaultTheme);

const styles = computed(() => {
	let styles = '';
	const _theme = theme.value;

	styles += `
		${selector} {
			${genVar('white', 'fff')}
			${genVar('black', '000')}

			${genVar('darkest', _theme.darkest_)}
			${genVar('darker', _theme.darker_)}
			${genVar('dark', _theme.dark_)}
			${genVar('gray', _theme.gray_)}
			${genVar('gray-subtle', _theme.graySubtle_)}
			${genVar('light', _theme.light_)}
			${genVar('lighter', _theme.lighter_)}
			${genVar('lightest', _theme.lightest_)}

			${genVar('highlight', _theme.highlight_)}
			${genVar('highlight-fg', _theme.highlightFg_)}
			${genVar('backlight', _theme.backlight_)}
			${genVar('backlight-fg', _theme.backlightFg_)}
			${genVar('notice', _theme.notice_)}
			${genVar('notice-fg', _theme.noticeFg_)}
			${genVar('bi-bg', _theme.biBg_)}
			${genVar('bi-fg', _theme.biFg_)}
			${copyVar('bg', 'white')}
			${copyVar('bg-offset', 'lightest')}
			${genVar('bg-backdrop', _theme.bgBackdrop_)}
			${copyVar('bg-subtle', 'lighter')}
			${copyVar('fg', 'dark')}
			${copyVar('fg-muted', 'light')}
			${copyVar('link', 'backlight')}
			${copyVar('link-hover', 'black')}
			${copyVar('primary', 'link')}
			${copyVar('primary-fg', 'backlight-fg')}

			${genVar('highlight', _theme.darkHighlight_, true)}
			${genVar('backlight', _theme.darkBacklight_, true)}
			${genVar('notice', _theme.darkNotice_, true)}
			${genVar('bi-bg', _theme.darkBiBg_, true)}
			${genVar('bi-fg', _theme.darkBiFg_, true)}
			${copyVar('bg', 'dark', true)}
			${copyVar('bg-offset', 'darker', true)}
			${genVar('bg-backdrop', _theme.darkBgBackdrop_, true)}
			${copyVar('bg-subtle', 'gray-subtle', true)}
			${copyVar('fg', 'lightest', true)}
			${copyVar('fg-muted', 'light', true)}
			${genVar('link', _theme.darkHighlight_, true)}
			${copyVar('link-hover', 'white', true)}
			${copyVar('primary', 'link', true)}
			${genVar('primary-fg', _theme.darkPrimaryFg_, true)}
		}
	`;

	if ((isDark.value && !props.forceLight) || props.forceDark) {
		// Sync with the theme-dark() stylus mixin.
		styles += `
			${selector} {
				${darkVar('highlight')}
				${darkVar('backlight')}
				${darkVar('notice')}
				${darkVar('bi-bg')}
				${darkVar('bi-fg')}
				${darkVar('bg')}
				${darkVar('bg-offset')}
				${darkVar('bg-backdrop')}
				${darkVar('bg-subtle')}
				${darkVar('fg')}
				${darkVar('fg-muted')}
				${darkVar('link')}
				${darkVar('link-hover')}
				${darkVar('primary')}
				${darkVar('primary-fg')}
			}
		`;
	}

	// We collapse whitespace so that it's a smaller output.
	return styles.replace(/\s+/g, '');
});
</script>

<template>
	<div :id="id">
		<AppStyle :content="styles" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped></style>
