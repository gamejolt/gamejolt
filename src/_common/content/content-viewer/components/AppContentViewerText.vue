<script lang="ts" setup>
import { PropType, computed, h, toRefs } from 'vue';
import { Environment } from '../../../environment/environment.service';
import AppLinkExternal from '../../../link/AppLinkExternal.vue';
import { ContentObject } from '../../content-object';
import { useContentOwnerController } from '../../content-owner';
import AppContentViewerMention from './AppContentViewerMention.vue';
import AppContentViewerTag from './AppContentViewerTag.vue';

const props = defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});

const { contentData } = toRefs(props);
const { contentRules } = useContentOwnerController()!;

const isBold = computed(() => hasMark('strong'));
const isItalics = computed(() => hasMark('em'));
const isStrikethrough = computed(() => hasMark('strike'));
const isCode = computed(() => hasMark('code'));
const isLink = computed(() => hasMark('link'));
const isMention = computed(() => hasMark('mention'));
const isTag = computed(() => hasMark('tag'));

const text = computed(() => {
	const textData = contentData.value.text;

	if (textData && textData?.length > 64 && isLink.value) {
		if (contentRules.truncateLinks) {
			return textData.substring(0, 64) + '…';
		}
	}

	return textData;
});

function hasMark(mark: string) {
	return contentData.value.marks && contentData.value.marks.some(m => m.type === mark);
}

function getMarkAttrs(mark: string) {
	if (hasMark(mark)) {
		return contentData.value.marks.find(m => m.type === mark)!.attrs;
	}
	return {};
}

const contentNode = computed(() => {
	let vnode = h('span', {}, text.value ?? undefined);

	if (isLink.value) {
		const attrs = getMarkAttrs('link');
		const children = [vnode];

		// Make sure the href is prefaced by a protocol.
		let href = attrs.href as string;
		if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(href)) {
			href = '//' + href;
		}

		const elementAttrs = {
			href,
		} as any;
		if (attrs.title && attrs.title !== attrs.href) {
			elementAttrs.title = attrs.title + ' (' + href + ')';
		} else {
			elementAttrs.title = attrs.href;
		}

		// If this is a local link to gamejolt.com, we want to open it in
		// same tab, otherwise we open in new window.
		const ourHost =
			href.startsWith(Environment.baseUrl) || href.startsWith(Environment.baseUrlInsecure);

		if (ourHost) {
			vnode = h('a', elementAttrs, {
				default: () => children,
			});
		} else {
			vnode = h(AppLinkExternal, elementAttrs, {
				default: () => children,
			});
		}
	} else if (isMention.value) {
		const attrs = getMarkAttrs('mention');
		const children = [vnode];

		vnode = h(
			AppContentViewerMention,
			{ username: attrs.username },
			{
				default: () => children,
			}
		);
	} else if (isTag.value) {
		const attrs = getMarkAttrs('tag');
		const children = [vnode];

		vnode = h(
			AppContentViewerTag,
			{ tag: attrs.tag },
			{
				default: () => children,
			}
		);
	}

	if (isBold.value) {
		vnode = h('strong', {}, [vnode]);
	}
	if (isItalics.value) {
		vnode = h('em', {}, [vnode]);
	}
	if (isStrikethrough.value) {
		vnode = h('s', {}, [vnode]);
	}
	if (isCode.value) {
		vnode = h('code', {}, [vnode]);
	}
	return vnode;
});
</script>

<template>
	<component :is="contentNode" />
</template>
