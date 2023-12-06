import { h } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppWidgetCompilerWidgetGamePackages from './AppWidgetCompilerWidgetGamePackages.vue';

export class WidgetCompilerWidgetGamePackages extends WidgetCompilerWidget {
	readonly name = 'game-packages';

	compile(context: WidgetCompilerContext, params: string[] = []) {
		const namedParams = this.namedParams(params);

		return h(AppWidgetCompilerWidgetGamePackages, {
			sellables: context['sellables'],
			theme: namedParams['theme'] || 'dark',
		});
	}
}
