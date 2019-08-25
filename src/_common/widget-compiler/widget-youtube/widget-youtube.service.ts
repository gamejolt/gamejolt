import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import AppVideoEmbed from '../../video/embed/embed.vue'
import { WidgetCompilerContext } from '../widget-compiler.service';

export class WidgetCompilerWidgetYoutube extends WidgetCompilerWidget {
	readonly name = 'youtube';

	compile(h: CreateElement, _context: WidgetCompilerContext, params: string[] = []) {
		if (!params || !params.length) {
			throw new Error(`Invalid params for widget.`);
		}

		const videoId = params[0];

		return h(AppVideoEmbed, {
			props: {
				videoProvider: 'youtube',
				videoId,
			},
		});
	}
}
