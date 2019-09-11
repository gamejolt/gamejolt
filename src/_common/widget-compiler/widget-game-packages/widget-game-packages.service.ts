import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppWidgetCompilerWidgetGamePackages from './widget-game-packages.vue'

export class WidgetCompilerWidgetGamePackages extends WidgetCompilerWidget {
	readonly name = 'game-packages';

	compile(h: CreateElement, context: WidgetCompilerContext, params: string[] = []) {
		const namedParams = this.namedParams(params);

		return h(AppWidgetCompilerWidgetGamePackages, {
			props: {
				sellables: context['sellables'],
				theme: namedParams['theme'] || 'dark',
			},
		});
	}
}
