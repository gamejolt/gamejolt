<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue';

type Props = {
	definition: any;
	theme: any;
};
const { definition, theme } = defineProps<Props>();

const styleEl = useTemplateRef('styleEl');

function refreshStyles(themeDefinition: any, currentTheme: any) {
	const styles: string[] = [];
	const fonts: string[] = [];
	const css: string[] = [];

	Object.keys(themeDefinition.definitions).forEach((field: string) => {
		const definition = themeDefinition.definitions[field];

		if (currentTheme && typeof currentTheme[field] !== 'undefined' && currentTheme[field]) {
			let propertyValue: string;
			if (definition.type === 'image') {
				propertyValue = 'url("' + currentTheme[field].img_url + '")';
			} else if (definition.type === 'background-repeat') {
				if (currentTheme[field] === 'repeat-x') {
					propertyValue = 'repeat-x';
				} else if (currentTheme[field] === 'repeat-y') {
					propertyValue = 'repeat-y';
				} else if (currentTheme[field] === 'no-repeat') {
					propertyValue = 'no-repeat';
				} else {
					propertyValue = 'repeat';
				}
			} else if (definition.type === 'background-position') {
				if (currentTheme[field] === 'topLeft') {
					propertyValue = 'top left';
				} else if (currentTheme[field] === 'topRight') {
					propertyValue = 'top right';
				} else if (currentTheme[field] === 'right') {
					propertyValue = 'center right';
				} else if (currentTheme[field] === 'bottomRight') {
					propertyValue = 'bottom right';
				} else if (currentTheme[field] === 'bottom') {
					propertyValue = 'bottom center';
				} else if (currentTheme[field] === 'bottomLeft') {
					propertyValue = 'bottom left';
				} else if (currentTheme[field] === 'left') {
					propertyValue = 'center left';
				} else if (currentTheme[field] === 'middle') {
					propertyValue = 'center center';
				} else {
					propertyValue = 'top center';
				}
			} else if (definition.type === 'fontFamily') {
				propertyValue = `'${currentTheme[field].family}'`;
				fonts.push(
					'@import url(//fonts.googleapis.com/css?family=' +
						currentTheme[field].family.replace(/ /g, '+') +
						');'
				);
			} else if (definition.type === 'css') {
				css.push(currentTheme[field]);
				return;
			} else {
				propertyValue = currentTheme[field];
			}

			for (const injection of definition.injections || [definition]) {
				if (typeof injection.property === 'undefined') {
					continue;
				}

				const rule = `${injection.selector} { ${injection.property}: ${propertyValue} !important }`;
				styles.push(rule);
			}
		}
	});

	let stylesCompiled = styles.join('');
	stylesCompiled = fonts.join('') + stylesCompiled;
	stylesCompiled += ' ' + css.join(' ');

	styleEl.value!.innerHTML = stylesCompiled;
}

onMounted(() => {
	window.addEventListener('message', (event: MessageEvent) => {
		if (event.data.type === 'theme-update' && event.data.theme && event.data.definition) {
			refreshStyles(event.data.definition, event.data.theme);
		}
	});

	refreshStyles(definition, theme);
});
</script>

<template>
	<style ref="styleEl" />
</template>
