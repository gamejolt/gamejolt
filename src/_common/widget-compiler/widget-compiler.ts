import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { WidgetCompiler, WidgetCompilerContext } from './widget-compiler.service';

@Options({})
export class AppWidgetCompiler extends Vue {
	@Prop(String) content!: string;
	@Prop({ type: Boolean, default: false })
	isDisabled!: boolean;

	@Prop({
		type: WidgetCompilerContext,
		default: () => new WidgetCompilerContext(),
	})
	context!: WidgetCompilerContext;

	render() {
		if (!this.content) {
			return h('div');
		}

		if (this.isDisabled) {
			return h('div', { domProps: { innerHTML: this.content } });
		}

		return WidgetCompiler.compile(h, this.context, this.content);
	}
}
