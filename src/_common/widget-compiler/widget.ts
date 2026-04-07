import { VNode } from 'vue';
import { WidgetCompilerContext } from './widget-compiler.service';

export abstract class WidgetCompilerWidget {
	abstract readonly name: string;
	abstract compile(context: WidgetCompilerContext, params: string[]): VNode;

	namedParams(params: string[] = []) {
		const namedParams: { [k: string]: string } = {};
		for (const param of params) {
			if (param.indexOf('=') === -1) {
				continue;
			}

			const pieces = param.split('=');
			if (pieces.length !== 2) {
				continue;
			}

			namedParams[pieces[0]] = pieces[1];
		}

		return namedParams;
	}
}
