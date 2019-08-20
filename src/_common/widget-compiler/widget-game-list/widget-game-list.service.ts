import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppWidgetCompilerWidgetGameList from './widget-game-list.vue'

export class WidgetCompilerWidgetGameList extends WidgetCompilerWidget {
	readonly name = 'game-list';

	compile(h: CreateElement, context: WidgetCompilerContext, _params: string[] = []) {
		return h(AppWidgetCompilerWidgetGameList, {
			props: {
				games: context['games'],
			},
		});
	}
}
