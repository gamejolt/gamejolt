import { h } from 'vue';

import AppVideoEmbed from '~common/video/embed/AppVideoEmbed.vue';
import { WidgetCompilerWidget } from '~common/widget-compiler/widget';
import { WidgetCompilerContext } from '~common/widget-compiler/widget-compiler.service';

export class WidgetCompilerWidgetVimeo extends WidgetCompilerWidget {
	readonly name = 'vimeo';

	compile(_context: WidgetCompilerContext, params: string[] = []) {
		if (!params || !params.length) {
			throw new Error(`Invalid params for widget.`);
		}

		const videoId = params[0];

		return h(AppVideoEmbed, {
			videoProvider: 'vimeo',
			videoId,
		});
	}
}
