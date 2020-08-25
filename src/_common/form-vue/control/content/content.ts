import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';
import { ContentContext } from '../../../content/content-context';
import AppContentEditorTS from '../../../content/content-editor/content-editor';
import { AppContentEditorLazy } from '../../../content/content-editor/content-editor-lazy';
import { ContentRules } from '../../../content/content-editor/content-rules';
import BaseFormControlTS from '../base';

@Component({
	components: {
		AppContentEditor: AppContentEditorLazy,
	},
})
export default class AppFormControlContent extends BaseFormControlTS {
	@Prop(String)
	contentContext!: ContentContext;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	@Prop(Boolean)
	disabled!: boolean;

	@Prop(Boolean)
	autofocus!: boolean;

	@Prop({ type: Number, default: null })
	modelId!: number;

	@Prop(Number)
	minHeight!: number;

	@Prop(String)
	startupActivity?: string;

	@Prop(Object) tempResourceContextData?: Object;

	@Prop(propOptional(Boolean, false)) compact!: boolean;

	@Prop(propOptional(Boolean, false)) singleLineMode!: boolean;

	@Prop(propOptional(Number, 200)) maxHeight!: number;

	@Prop(propOptional(ContentRules)) displayRules?: ContentRules;

	$refs!: {
		editor: AppContentEditorTS;
	};

	controlVal = '';

	onChange(source: string) {
		this.applyValue(source);
	}

	@Emit('focus')
	onFocus() {}

	@Emit('blur')
	onBlur() {}

	@Emit('submit')
	onSubmit() {}

	@Emit('insert-block-node')
	onInsertBlockNode(_nodeType: string) {}

	public focus() {
		this.$refs.editor.focus();
	}
}
