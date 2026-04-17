import { h } from 'vue';

import AppVideoEmbed from '~common/video/embed/AppVideoEmbed.vue';
import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';

export class WidgetCompilerWidgetYoutube extends WidgetCompilerWidget {
	readonly name = 'youtube';

	compile(_context: WidgetCompilerContext, params: string[] = []) {
		if (!params || !params.length) {
			throw new Error(`Invalid params for widget.`);
		}

		const videoId = params[0];

		return h(AppVideoEmbed, {
			videoProvider: 'youtube',
			videoId,
		});
	}
}
