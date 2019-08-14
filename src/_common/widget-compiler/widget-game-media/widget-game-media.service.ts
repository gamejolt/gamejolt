import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppWidgetCompilerWidgetGameMedia from './widget-game-media.vue'

export class WidgetCompilerWidgetGameMedia extends WidgetCompilerWidget {
	readonly name = 'game-media';

	compile(h: CreateElement, context: WidgetCompilerContext, params: string[] = []) {
		const namedParams = this.namedParams(params);

		return h(AppWidgetCompilerWidgetGameMedia, {
			props: {
				items: context['mediaItems'] || [],
				num: parseInt(namedParams['num'], 10) || 6,
			},
		});
	}
}
