import { reactive } from '@vue/reactivity';
import { computed, readonly, ref, Ref } from 'vue';
import { ContextCapabilities } from './content-context';
import { ContentDocument } from './content-document';
import { ContentRules } from './content-editor/content-rules';
import { ContentHydrator } from './content-hydrator';

export const ContentOwnerControllerKey = Symbol('content-owner-controller');

export type ContentOwnerController = ReturnType<typeof createContentOwnerController>;

interface ContentOwnerControllerOptions {
	contentRules: Ref<ContentRules | null>;
	disableLightbox?: Ref<boolean>;
	modelId?: Ref<number | null>;
}

export function createContentOwnerController(options: ContentOwnerControllerOptions) {
	const doc = ref<ContentDocument | null>(null);
	const hydrator = ref<ContentHydrator>(new ContentHydrator());

	const capabilities = computed(() => {
		if (doc.value) {
			return ContextCapabilities.getForContext(context.value);
		}
		return ContextCapabilities.getEmpty();
	});

	const contentRules = computed(() => {
		if (options.contentRules.value) {
			return options.contentRules.value;
		}
		return new ContentRules();
	});

	const content = computed(() => {
		if (doc.value) {
			return doc.value.content;
		}
		return [];
	});

	const context = computed(() => {
		if (doc.value) {
			return doc.value.context;
		}
		throw new Error('No context assigned to viewer');
	});

	const disableLightbox = computed(() => {
		if (options.disableLightbox) {
			return options.disableLightbox.value;
		}
		return false;
	});

	const modelId = computed(() => {
		if (options.modelId) {
			return options.modelId.value;
		}
		return null;
	});

	return reactive({
		doc,
		hydrator,
		capabilities,
		contentRules,
		context,
		disableLightbox,
		modelId,
		content: readonly(content),
	});
}
