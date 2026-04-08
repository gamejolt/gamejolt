import { h } from 'vue';

import AppWidgetCompiler from '../AppWidgetCompiler.vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';

export class WidgetCompilerWidgetGameDescription extends WidgetCompilerWidget {
	readonly name = 'game-description';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			content: context['game'] && context['game'].description_compiled,
		});
	}
}
