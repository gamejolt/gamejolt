import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompiler } from '../widget-compiler';

export class WidgetCompilerWidgetUserBio extends WidgetCompilerWidget {
	readonly name = 'user-bio';

	compile(h: CreateElement, context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			props: {
				content: context['user'] && context['user'].description_compiled,
			},
		});
	}
}
