import { h } from 'vue';
import AppVideoEmbed from '../../video/embed/AppVideoEmbed.vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';

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
