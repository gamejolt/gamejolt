import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import AppFormControlMarkdown from '../../form-vue/controls/markdown/AppFormControlMarkdown.vue';
import { BaseForm } from '../../form-vue/form.service';
import { SiteContentBlock } from '../../site/content-block/content-block-model';

class Wrapper extends BaseForm<SiteContentBlock> {}

@Options({
	components: {
		AppFormControlMarkdown,
	},
})
export default class FormContentBlockEditor extends mixins(Wrapper) {
	modelClass = SiteContentBlock;

	@Prop(String) mode!: string;

	@Watch('formModel.content_markdown')
	onContentChanged(content: string) {
		if (this.model) {
			// TODO: why are we setting on the model directly? Is this a bug?
			(this.model as SiteContentBlock).content_markdown! = content;
		}
	}

	created() {
		this.form.warnOnDiscard = false;
	}
}
