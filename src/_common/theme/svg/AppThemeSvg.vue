<script lang="ts" setup>
import { darken, lighten, parseToHsl } from 'polished';
import { computed, ImgHTMLAttributes, ref, watch } from 'vue';

import { Api } from '~common/api/api.service';
import { isDynamicGoogleBot } from '~common/device/device.service';
import { DefaultTheme, ThemeModel } from '~common/theme/theme.model';
import { useThemeStore } from '~common/theme/theme.store';
import { arrayUnique } from '~utils/array';

const SvgGraysRegex = /#([a-f\d]{1,2})\1{2}\b/gi;

type Props = {
	src?: string;
	theme?: ThemeModel | null;
	strictColors?: boolean;
} & /* @vue-ignore */ Pick<ImgHTMLAttributes, 'alt' | 'width' | 'height'>;

const { src = '', theme = null, strictColors } = defineProps<Props>();

const { theme: storeTheme, isDark } = useThemeStore();
const rawSvg = ref('');
let _request: Promise<any> | undefined;

const actualTheme = computed(() => theme || storeTheme.value);

const processedSvg = computed(() => {
	if (import.meta.env.SSR || isDynamicGoogleBot()) {
		return src;
	}

	let svgData = rawSvg.value;

	if (actualTheme.value) {
		let highlight = '#' + actualTheme.value.highlight;
		let backlight = '#' + actualTheme.value.backlight;
		let notice = '#' + actualTheme.value.notice;

		if (actualTheme.value.custom) {
			const highlight_ =
				'#' +
				(isDark.value ? actualTheme.value.darkHighlight_ : actualTheme.value.highlight_);
			const hsl = parseToHsl(highlight_);
			if (hsl.lightness < 0.4) {
				highlight = lighten(0.3, highlight_);
				backlight = highlight_;
			} else {
				highlight = highlight_;
				backlight = darken(0.3, highlight_);
			}
			notice = highlight;
		}

		// Process svgData as a String so we don't throw errors in the
		// ThemeSvg styleguide if the custom svg string is a number.
		let grays = String(svgData).match(SvgGraysRegex);

		if (grays) {
			const uniqueGrays = arrayUnique(grays);

			for (const gray of uniqueGrays) {
				svgData = svgData.replace(gray, '#' + actualTheme.value.tintColor(gray, 0.04));
			}
		}

		// Same as above, need to convert svgData to a string in case
		// the custom svg input from the ThemeSvg styleguide is a number.
		svgData = String(svgData)
			.replace(/#ccff00/gi, highlight)
			.replace(/#cf0/gi, highlight)
			.replace(/#2f7f6f/gi, !strictColors && isDark.value ? highlight : backlight)
			.replace(/#ff3fac/gi, notice)
			.replace(/#31d6ff/gi, !strictColors && isDark.value ? highlight : backlight);
	} else if (!strictColors) {
		// If we have no theme from the prop or the ThemeStore, that means
		// we're using the default theme colors and only need to replace our
		// highlight/backlight colors.
		const { highlight, backlight } = DefaultTheme;

		svgData = String(svgData)
			.replace(/#2f7f6f/gi, isDark.value ? '#' + highlight : '#' + backlight)
			.replace(/#31d6ff/gi, isDark.value ? '#' + highlight : '#' + backlight);
	}

	return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgData);
});

if (!import.meta.env.SSR && !isDynamicGoogleBot()) {
	watch(
		() => src,
		src => {
			const request = Api.sendRawRequest(src).then(response => {
				// If we have multiple requests in process, only handle the latest one.
				if (!_request || _request !== request) {
					return;
				}

				if (response.status === 200) {
					rawSvg.value = response.data;
				}
			});

			_request = request;
		},
		{ immediate: true }
	);
}
</script>

<template>
	<img :src="processedSvg" />
</template>
