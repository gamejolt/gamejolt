<script lang="ts">
import { defineComponent, h } from 'vue';

import { WidgetCompiler, WidgetCompilerContext } from './widget-compiler.service';

/**
 * Compiles widget markup (e.g. {% youtube id %}) into live VNodes. Uses a
 * render function because the output is dynamic VNodes from the compiler, not
 * a static template.
 */
export default defineComponent({
	props: {
		content: {
			type: String,
			default: '',
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		context: {
			type: WidgetCompilerContext,
			default: () => new WidgetCompilerContext(),
		},
	},
	setup(props) {
		return () => {
			if (!props.content) {
				return h('div');
			}

			if (props.isDisabled) {
				return h('div', { innerHTML: props.content });
			}

			return WidgetCompiler.compile(props.context, props.content);
		};
	},
});
</script>
