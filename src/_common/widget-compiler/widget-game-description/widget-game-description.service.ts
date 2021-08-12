import { h } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { AppWidgetCompiler } from '../widget-compiler';
import { WidgetCompilerContext } from '../widget-compiler.service';

export class WidgetCompilerWidgetGameDescription extends WidgetCompilerWidget {
	readonly name = 'game-description';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			content: context['game'] && context['game'].description_compiled,
		});
	}
}
