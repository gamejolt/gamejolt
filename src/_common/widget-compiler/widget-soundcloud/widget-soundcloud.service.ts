import { CreateElement } from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import AppWidgetCompilerWidgetSoundcloud from './widget-soundcloud.vue'

export class WidgetCompilerWidgetSoundcloud extends WidgetCompilerWidget {
	readonly name = 'soundcloud';

	compile(h: CreateElement, _context: WidgetCompilerContext, params: string[] = []) {
		if (!params || !params.length) {
			throw new Error(`Invalid params for widget.`);
		}
		// Track ID is always first.
		const trackId = params[0];

		// Then an optional color.
		let color = '';
		if (params[1]) {
			color = params[1].replace(/[^0-9A-Za-z]/g, '');
		}

		return h(AppWidgetCompilerWidgetSoundcloud, {
			props: {
				trackId,
				color,
			},
		});
	}
}
