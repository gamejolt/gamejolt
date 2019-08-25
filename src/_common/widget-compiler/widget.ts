import Vue, { CreateElement, VNode } from 'vue';
import { WidgetCompilerContext } from './widget-compiler.service';

export abstract class WidgetCompilerWidget {
	abstract readonly name: string;
	abstract compile(h: CreateElement, context: WidgetCompilerContext, params: string[]): VNode;

	wrapComponent(h: CreateElement, component: typeof Vue, propGetter: () => any) {
		// Not sure if there is a way to do this without instantiating a new
		// component.
		const options = new component().$options;

		return h(options, {
			props: propGetter(),
		});
	}

	namedParams(params: string[] = []) {
		let namedParams: { [k: string]: string } = {};
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
