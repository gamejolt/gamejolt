import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppVideoEmbed from '../../video/embed/embed.vue'

export class WidgetCompilerWidgetVimeo extends WidgetCompilerWidget {
	readonly name = 'vimeo';

	compile(h: CreateElement, _context: WidgetCompilerContext, params: string[] = []) {
		if (!params || !params.length) {
			throw new Error(`Invalid params for widget.`);
		}

		const videoId = params[0];

		return h(AppVideoEmbed, {
			props: {
				videoProvider: 'vimeo',
				videoId,
			},
		});
	}
}
