import { h } from 'vue';

import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';
import AppWidgetCompilerWidgetGamePackages from '~common/widget-compiler/widget-game-packages/AppWidgetCompilerWidgetGamePackages.vue';

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
