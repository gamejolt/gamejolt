import { computed, provide } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { ContentDocument } from '../content-document';
import { ContentRules } from '../content-editor/content-rules';
import { ContentHydrator } from '../content-hydrator';
import {
	ContentOwnerController,
	ContentOwnerControllerKey,
	createContentOwnerController,
} from '../content-owner';
import { AppContentViewerBaseComponent } from './components/base-component';

@Options({
	components: {
		AppContentViewerBaseComponent,
	},
})
export default class AppContentViewer extends Vue {
	@Prop(propRequired(String)) source!: string;
	@Prop(propOptional(Boolean, false)) disableLightbox!: boolean;
	@Prop(propOptional(Object)) displayRules?: ContentRules;

	// Gets provided down during [created].
	controller!: ContentOwnerController;

	get viewerStyleClass() {
		if (!this.controller.doc) {
			return '';
		}
		return this.controller.context + '-content';
	}

	created() {
		this.controller = createContentOwnerController({
			contentRules: computed(() => {
				return (this.$props as this).displayRules ?? null;
			}),
			disableLightbox: computed(() => {
				return (this.$props as this).disableLightbox === true;
			}),
		});

		provide(ContentOwnerControllerKey, this.controller);

		this.updatedSource();
	}

	setContent(content: ContentDocument) {
		this.controller.doc = content;
		this.controller.hydrator = new ContentHydrator(content.hydration);
	}

	@Watch('source')
	updatedSource() {
		if (this.source) {
			const sourceDoc = ContentDocument.fromJson(this.source);
			this.setContent(sourceDoc);
		} else {
			this.controller.doc = null;
		}
	}

	onClickCopy() {
		(navigator as any).clipboard.writeText(this.source);
	}
}
