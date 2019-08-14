import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppThemeInjector extends Vue {
	@Prop(Object) definition!: any;
	@Prop(Object) theme!: any;

	mounted() {
		window.addEventListener('message', (event: MessageEvent) => {
			switch (event.data.type) {
				case 'theme-update':
					if (!event.data.theme || !event.data.definition) {
						break;
					}

					this.refreshStyles(event.data.definition, event.data.theme);
					break;
			}
		});

		this.refreshStyles(this.definition, this.theme);
	}

	render(h: CreateElement) {
		return h('style');
	}

	private refreshStyles(themeDefinition: any, currentTheme: any) {
		let styles: string[] = [];
		let fonts: string[] = [];
		let css: string[] = [];

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
					// If no property, skip it.
					if (typeof injection.property === 'undefined') {
						continue;
					}

					const rule = `${injection.selector} { ${injection.property}: ${
						propertyValue
					} !important }`;
					styles.push(rule);
				}
			}
		});

		let stylesCompiled = styles.join('');

		// Put in font imports first.
		stylesCompiled = fonts.join('') + stylesCompiled;

		// Put CSS last.
		stylesCompiled += ' ' + css.join(' ');

		// Add it to the element.
		this.$el.innerHTML = stylesCompiled;
	}
}
