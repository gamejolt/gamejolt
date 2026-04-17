import { h } from 'vue';

import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';
import AppWidgetCompilerWidgetGameMedia from '~common/widget-compiler/widget-game-media/AppWidgetCompilerWidgetGameMedia.vue';

export class WidgetCompilerWidgetGameMedia extends WidgetCompilerWidget {
	readonly name = 'game-media';

	compile(context: WidgetCompilerContext, params: string[] = []) {
		const namedParams = this.namedParams(params);

		return h(AppWidgetCompilerWidgetGameMedia, {
			items: context['mediaItems'] || [],
			num: parseInt(namedParams['num'], 10) || 6,
		});
	}
}
