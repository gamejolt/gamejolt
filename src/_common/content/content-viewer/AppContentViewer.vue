<script lang="ts" setup>
import { computed, provide, ref, watch } from 'vue';

import { ContextCapabilities } from '~common/content/content-context';
import { ContentDocument } from '~common/content/content-document';
import { ContentHydrator } from '~common/content/content-hydrator';
import {
	ContentOwnerControllerKey,
	ContentOwnerParentBounds,
	createContentOwnerController,
} from '~common/content/content-owner';
import { ContentRules } from '~common/content/content-rules';
import AppContentViewerBaseComponent from '~common/content/content-viewer/components/AppContentViewerBaseComponent.vue';

type Props = {
	source: string;
	disableLightbox?: boolean;
	displayRules?: ContentRules;
	parentBounds?: ContentOwnerParentBounds;
};
const { source, disableLightbox, displayRules, parentBounds } = defineProps<Props>();

const doc = ref(source ? ContentDocument.fromJson(source) : null);

const viewerStyleClass = computed(() => {
	if (!doc.value) {
		return '';
	}
	return controller.value.context + '-content';
});

const content = computed(() => (doc.value ? ([...doc.value.content] as any[]) : []));
const context = computed(() => doc.value!.context);
const capabilities = computed(() => ContextCapabilities.getPlaceholder());
const contentRules = computed(() => displayRules);
const maybeParentBounds = computed(() => parentBounds);

const controller = ref(
	createContentOwnerController({
		context: context.value,
		capabilities: capabilities.value,
		contentRules: contentRules.value,
		disableLightbox: disableLightbox,
		parentBounds: maybeParentBounds.value,
	})
);

provide(ContentOwnerControllerKey, controller.value);

watch(() => source, updatedSource, { immediate: true });

function updatedSource() {
	if (source) {
		const sourceDoc = ContentDocument.fromJson(source);
		setContent(sourceDoc);
	} else {
		doc.value = null;
	}
}

function setContent(content: ContentDocument) {
	doc.value = content;
	controller.value.hydrator = new ContentHydrator(doc.value.hydration);
}
</script>

<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<AppContentViewerBaseComponent
			v-if="doc"
			:content="content"
			:content-rules="controller.contentRules"
		/>
	</div>
</template>

<style lang="stylus" scoped>
:deep(p > code)
	white-space: normal

// Because white space is rendered out in the editor, we want the viewer to get as close to that
// as possible. HTML by default collapses white space, and this overrides that behavior.
:deep(p > span)
	white-space: pre-wrap
	white-space: break-spaces
</style>
