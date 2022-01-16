<script lang="ts">
import { computed, provide } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
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
	@Prop({ type: String, required: true }) source!: string;
	@Prop({ type: Boolean, default: false }) disableLightbox!: boolean;
	@Prop(Object) displayRules?: ContentRules;

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
</script>

<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<app-content-viewer-base-component v-if="controller.doc" :content="controller.content" />
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
