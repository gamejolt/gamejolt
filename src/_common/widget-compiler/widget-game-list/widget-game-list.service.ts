import { h } from 'vue';

import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';
import AppWidgetCompilerWidgetGameList from '~common/widget-compiler/widget-game-list/AppWidgetCompilerWidgetGameList.vue';

export class WidgetCompilerWidgetGameList extends WidgetCompilerWidget {
	readonly name = 'game-list';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompilerWidgetGameList, {
			games: context['games'],
		});
	}
}
