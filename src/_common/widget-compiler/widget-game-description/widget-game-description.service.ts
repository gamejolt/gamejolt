import { h } from 'vue';

import AppWidgetCompiler from '~common/widget-compiler/AppWidgetCompiler.vue';
import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';

export class WidgetCompilerWidgetGameDescription extends WidgetCompilerWidget {
	readonly name = 'game-description';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			content: context['game'] && context['game'].description_compiled,
		});
	}
}
