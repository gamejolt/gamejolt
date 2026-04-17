import { h } from 'vue';

import AppWidgetCompiler from '~common/widget-compiler/AppWidgetCompiler.vue';
import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';

export class WidgetCompilerWidgetUserBio extends WidgetCompilerWidget {
	readonly name = 'user-bio';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompiler, {
			content: context['user']?.description_compiled,
		});
	}
}
