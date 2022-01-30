import { h } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { AppWidgetCompiler } from '../widget-compiler';
import { WidgetCompilerContext } from '../widget-compiler.service';

export class WidgetCompilerWidgetUserBio extends WidgetCompilerWidget {
	readonly name = 'user-bio';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			content: context['user']?.description_compiled,
		});
	}
}
