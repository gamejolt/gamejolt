import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { WidgetCompiler, WidgetCompilerContext } from './widget-compiler.service';

@Component({})
export class AppWidgetCompiler extends Vue {
	@Prop(String) content!: string;
	@Prop({ type: Boolean, default: false })
	isDisabled!: boolean;

	@Prop({
		type: WidgetCompilerContext,
		default: () => new WidgetCompilerContext(),
	})
	context!: WidgetCompilerContext;

	render(h: CreateElement) {
		if (!this.content) {
			return h('div');
		}

		if (this.isDisabled) {
			return h('div', { domProps: { innerHTML: this.content } });
		}

		return WidgetCompiler.compile(h, this.context, this.content);
	}
}
