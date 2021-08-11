import { Options, Prop, Watch } from 'vue-property-decorator';
import AppFormControlMarkdown from '../../form-vue/control/markdown/markdown.vue';
import { BaseForm } from '../../form-vue/form.service';
import { SiteContentBlock } from '../../site/content-block/content-block-model';

@Options({
	components: {
		AppFormControlMarkdown,
	},
})
export default class FormContentBlockEditor extends BaseForm<SiteContentBlock> {
	modelClass = SiteContentBlock;
	warnOnDiscard = false;

	@Prop(String) mode!: string;

	@Watch('formModel.content_markdown')
	onContentChanged(content: string) {
		if (this.model) {
			// TODO: why are we setting on the model directly? Is this a bug?
			(this.model as SiteContentBlock).content_markdown! = content;
		}
	}
}
