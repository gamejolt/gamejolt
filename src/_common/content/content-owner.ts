import { computed, inject, InjectionKey, reactive, ref } from 'vue';
import { MaybeRef } from '../../utils/vue';
import { ContentContext, ContextCapabilities } from './content-context';
import { ContentRules } from './content-editor/content-rules';
import { ContentHydrator } from './content-hydrator';

export const ContentOwnerControllerKey: InjectionKey<ContentOwnerController> = Symbol(
	'content-owner-controller'
);

export type ContentOwnerController = ReturnType<typeof createContentOwnerController>;

export function useContentOwnerController() {
	return inject(ContentOwnerControllerKey, null);
}

interface ContentOwnerControllerOptions {
	context: MaybeRef<ContentContext>;
	capabilities: MaybeRef<ContextCapabilities>;
	contentRules?: MaybeRef<ContentRules | undefined>;
	disableLightbox?: MaybeRef<boolean | undefined>;
	getModelData?: () => ContentEditorModelData | undefined;
	getModelId?: () => Promise<number>;
	parentBounds?: MaybeRef<ContentOwnerParentBounds | undefined>;
}

export interface ContentOwnerParentBounds {
	width: MaybeRef<number>;
}

type EmojiCommentParentResource = 'Fireside_Post' | 'Game' | 'User';

export type ContentEditorModelData =
	| {
			type: 'resource';
			resourceId: number;
			resource: string;
	  }
	| {
			type: 'commentingOnResource';
			resourceId: number;
			resource: EmojiCommentParentResource;
	  }
	| { type: 'newChatMessage'; chatRoomId: number }
	| { type: 'supporterMessage' };

export function createContentOwnerController(options: ContentOwnerControllerOptions) {
	const { getModelData, getModelId } = options;

	const hydrator = ref<ContentHydrator>(new ContentHydrator());

	const disableLightbox = ref(options.disableLightbox);
	const context = ref(options.context);
	const capabilities = ref(options.capabilities);
	const parentBounds = ref(options.parentBounds);

	const _contentRules = ref(options.contentRules);
	const contentRules = computed(() => _contentRules.value ?? new ContentRules());

	return reactive({
		context,
		capabilities,
		hydrator,
		contentRules,
		disableLightbox,
		getModelData,
		getModelId,
		parentBounds,
	});
}
