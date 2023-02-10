<script lang="ts" setup>
import { watch } from '@vue/runtime-core';
import { computed, PropType, provide, ref, toRefs } from 'vue';
import { ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentRules } from '../content-editor/content-rules';
import { ContentHydrator } from '../content-hydrator';
import {
	ContentOwnerControllerKey,
	ContentOwnerParentBounds,
	createContentOwnerController,
} from '../content-owner';
import AppContentViewerBaseComponent from './components/AppContentViewerBaseComponent.vue';

const props = defineProps({
	source: {
		type: String,
		required: true,
	},
	disableLightbox: {
		type: Boolean,
	},
	displayRules: {
		type: Object as PropType<ContentRules>,
		default: undefined,
	},
	parentBounds: {
		type: Object as PropType<ContentOwnerParentBounds>,
		default: undefined,
	},
});

const { source, disableLightbox, displayRules, parentBounds } = toRefs(props);

const doc = ref(source.value ? ContentDocument.fromJson(source.value) : null);

const viewerStyleClass = computed(() => {
	if (!doc.value) {
		return '';
	}
	return controller.value.context + '-content';
});

const content = computed(() => doc.value?.content ?? []);
const context = computed(() => doc.value!.context);
const capabilities = computed(() => ContextCapabilities.getEmpty());
const contentRules = computed(() => displayRules?.value);
const maybeParentBounds = computed(() => parentBounds?.value);

const controller = ref(
	createContentOwnerController({
		context: context.value,
		capabilities: capabilities.value,
		contentRules: contentRules.value,
		disableLightbox: disableLightbox.value,
		parentBounds: maybeParentBounds.value,
	})
);

provide(ContentOwnerControllerKey, controller.value);

watch(source, updatedSource, { immediate: true });

function updatedSource() {
	if (source.value) {
		const sourceDoc = ContentDocument.fromJson(source.value);
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
::v-deep(p > code)
	white-space: normal

// Because white space is rendered out in the editor, we want the viewer to get as close to that
// as possible. HTML by default collapses white space, and this overrides that behavior.
::v-deep(p > span)
	white-space: pre-wrap
	white-space: break-spaces
</style>
