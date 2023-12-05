import { h } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppWidgetCompilerWidgetGameList from './AppWidgetCompilerWidgetGameList.vue';

export class WidgetCompilerWidgetGameList extends WidgetCompilerWidget {
	readonly name = 'game-list';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompilerWidgetGameList, {
			games: context['games'],
		});
	}
}
