<script lang="ts">
import { computed, PropType, provide } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentRules } from '../content-editor/content-rules';
import { ContentHydrator } from '../content-hydrator';
import {
	ContentOwnerController,
	ContentOwnerControllerKey,
	ContentOwnerParentBounds,
	createContentOwnerController,
} from '../content-owner';
import { AppContentViewerBaseComponent } from './components/base-component';

@Options({
	components: {
		AppContentViewerBaseComponent,
	},
})
export default class AppContentViewer extends Vue {
	@Prop({ type: String, required: true }) source!: string;
	@Prop({ type: Boolean, default: false }) disableLightbox!: boolean;
	@Prop(Object) displayRules?: ContentRules;

	@Prop({ type: Object as PropType<ContentOwnerParentBounds> })
	parentBounds?: ContentOwnerParentBounds;

	// Gets provided down during [created].
	controller!: ContentOwnerController;
	doc: ContentDocument | null = null;

	get viewerStyleClass() {
		if (!this.doc) {
			return '';
		}
		return this.controller.context + '-content';
	}

	get content() {
		return this.doc?.content ?? [];
	}

	created() {
		const context = computed(() => this.doc!.context);

		this.controller = createContentOwnerController({
			context,
			capabilities: computed(() =>
				this.doc
					? ContextCapabilities.getForContext(context.value)
					: ContextCapabilities.getEmpty()
			),
			contentRules: computed(() => this.displayRules),
			disableLightbox: computed(() => this.disableLightbox === true),
			parentBounds: computed(() => this.parentBounds),
		});

		provide(ContentOwnerControllerKey, this.controller);

		this.updatedSource();
	}

	@Watch('source')
	updatedSource() {
		if (this.source) {
			const sourceDoc = ContentDocument.fromJson(this.source);
			this.setContent(sourceDoc);
		} else {
			this.doc = null;
		}
	}

	setContent(content: ContentDocument) {
		this.doc = content;
		this.controller.hydrator = new ContentHydrator(this.doc.hydration);
	}

	onClickCopy() {
		(navigator as any).clipboard.writeText(this.source);
	}
}
</script>

<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<AppContentViewerBaseComponent v-if="doc" :content="content" />
	</div>
</template>

<style lang="stylus" scoped>
::v-deep(p > code)
	white-space: normal

// Because white space is rendered out in the editor, we want the viewer to get as close to that
// as possible. HTML by default collapses white space, and this overrides that behavior.
::v-deep(p > span)
	white-space: pre-wrap
	white-space: break-spaces
</style>
