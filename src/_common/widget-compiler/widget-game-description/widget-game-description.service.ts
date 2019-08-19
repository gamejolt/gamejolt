import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompiler } from '../widget-compiler';

export class WidgetCompilerWidgetGameDescription extends WidgetCompilerWidget {
	readonly name = 'game-description';

	compile(h: CreateElement, context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			props: {
				content: context['game'] && context['game'].description_compiled,
			},
		});
	}
}
