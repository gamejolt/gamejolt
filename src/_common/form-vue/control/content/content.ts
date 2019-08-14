import { Component, Emit, Prop } from 'vue-property-decorator';
import { ContentContext } from '../../../content/content-context';
import { AppContentEditorLazy } from '../../../content/content-editor/content-editor-lazy';
import BaseFormControlTS from '../../../form-vue/control/base';

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

	controlVal = '';

	onChange(source: string) {
		this.applyValue(source);
	}

	@Emit('focus')
	onFocus() {}

	@Emit('blur')
	onBlur() {}
}
