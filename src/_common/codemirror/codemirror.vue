<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';

const defaultOptions = {
	lineNumbers: true,
	lineWrapping: true,
	tabSize: 4,
	indentWithTabs: true,
};

@Options({})
export default class AppCodemirror extends Vue {
	declare $el: HTMLTextAreaElement;

	@Prop(String) value!: string;
	@Prop({ type: Object, default: () => new Object() })
	options: any;

	private _options: any = {};
	private editor!: CodeMirror.EditorFromTextArea;
	private bootstrapped = false;

	@Emit('change')
	emitChange(_val: string) {}

	async mounted() {
		this._options = Object.assign(defaultOptions, this.options);

		if (this._options.mode === 'css') {
			await import('codemirror/mode/css/css.js' as any);
		} else if (this._options.mode === 'gfm') {
			await import('codemirror/mode/gfm/gfm.js' as any);
		}

		// Codemirror doesn't work in SSR, so bootstrap it in mounted().
		const CodeMirror = await import('codemirror');
		this.editor = CodeMirror.fromTextArea(this.$el, this._options);
		this.editor.setValue(this.value || '');

		this.editor.on('change', cm => {
			this.emitChange(cm.getValue());
		});

		this.bootstrapped = true;
	}

	@Watch('value')
	onValueChange(newVal: string) {
		if (!this.bootstrapped) {
			return;
		}

		const editorVal = this.editor.getValue();
		if (newVal === editorVal) {
			return;
		}

		const scrollInfo = this.editor.getScrollInfo();
		this.editor.setValue(newVal || '');
		this.editor.scrollTo(scrollInfo.left, scrollInfo.top);
	}

	@Watch('options')
	onOptionsChange(newVal: any) {
		if (!this.bootstrapped) {
			return;
		}

		if (typeof newVal !== 'object') {
			return;
		}

		this._options = Object.assign(defaultOptions, newVal);

		for (const optionName in Object.keys(this._options)) {
			this.editor.setOption(optionName, this._options[optionName]);
		}
	}

	beforeUnmount() {
		if (this.editor) {
			this.editor.toTextArea();
		}
	}
}
</script>

<template>
	<textarea />
</template>

<style lang="stylus">
// TODO(vue3): does this kind of import work anymore in vite?
@import '~codemirror/lib/codemirror.css'

// Based on Splash of Gray
$codemirror-bg = #161616
$codemirror-color = #F5F1F2
$codemirror-gutter-color = #5D5D5D
$codemirror-selection = #404040
$codemirror-caret-color = #FFFFFF
$codemirror-comment = #5D5D5D
$codemirror-green = #B6DB51
$codemirror-blay = #B4C2D6
$codemirror-pink = #FF5274
$codemirror-gray = #a4a9b0

// Style it out like a form control.
.CodeMirror
	rounded-corners()
	height: auto // Will make it auto-expand
	padding: $padding-base-vertical $padding-base-horizontal
	border: $border-width-base solid $input-border
	transition: border-color ease-in-out 0.15s

	pre.CodeMirror-placeholder
		theme-prop('color', 'light')

	&-focused
		border-color: $input-border-focus
		outline: 0

/**
 * Default theme.
 */
.CodeMirror
	background: $codemirror-bg
	color: $codemirror-color
	// Make it have the same styling as normal text on the page.
	font-family: $font-family-monospace
	font-size: $font-size-base
	line-height: $line-height-base

	div.CodeMirror-selected
		background: $codemirror-selection !important

	.CodeMirror-gutters
		background: $codemirror-bg
		border-right: 0

	.CodeMirror-linenumber
		font-family: $font-family-monospace
		color: $codemirror-gutter-color

	.CodeMirror-cursor
		border-left: 2px solid $codemirror-caret-color !important

	span.cm-comment
		color: $codemirror-comment

	span.cm-atom
	span.cm-quote
		color: $codemirror-color

	span.cm-number
		color: $codemirror-color

	span.cm-attribute
	span.cm-keyword
	span.cm-builtin
	span.cm-qualifier
	span.cm-tag
		color: $codemirror-green

	span.cm-string
	span.cm-header
		color: $codemirror-blay

	span.cm-property
	span.cm-link
		color: $codemirror-gray

	// Gotta figure these ones out.
	// span.cm-variable { color: #f8f8f2; }
	// span.cm-variable-2 { color: #9effff; }
	// span.cm-variable-3 { color: #66d9ef; }
	// span.cm-def { color: #fd971f; }
	// span.cm-bracket { color: #f8f8f2; }
	span.cm-error
		background: $codemirror-pink
		color: $codemirror-bg
</style>
