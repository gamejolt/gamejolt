<script lang="ts" setup>
import { computed, toRef } from 'vue';

import { ContentDocument } from '../../content/content-document';

type Props = {
	tags: string[];
	text: string;
	content: ContentDocument[];
};
const { tags, text, content } = defineProps<Props>();

const emit = defineEmits<{
	tag: [tag: string];
}>();

const shouldShow = toRef(
	() => tags.length && recommendedTags.value.length + otherTags.value.length > 0
);

const lcText = computed(() => {
	let newText = '';
	if (text) {
		newText += text.toLowerCase();
	}
	if (!!content && content.length > 0) {
		for (const contentDocument of content) {
			newText += contentDocument
				.getChildrenByType('text')
				.map(i => i.text)
				.join(' ')
				.toLowerCase();
		}
	}

	return newText;
});

const recommendedTags = computed(() => {
	if (tags.length === 0) {
		return [];
	}

	return tags
		.map(t => {
			const count = lcText.value.split(t.toLowerCase()).length - 1;
			let hashtagCount = 0;
			if (!!content && content.length > 0) {
				for (const contentDocument of content) {
					hashtagCount += contentDocument
						.getMarks('tag')
						.map(i => i.attrs.tag as string)
						.filter(i => i.toLowerCase() === t.toLowerCase()).length;
				}
			} else {
				hashtagCount = lcText.value.split('#' + t.toLowerCase()).length - 1;
			}
			return {
				tag: t,
				count: hashtagCount > 0 ? -1 : count,
			};
		})
		.filter(w => w.count > 0)
		.sort((a, b) => {
			if (a.count > b.count) {
				return -1;
			} else if (a.count < b.count) {
				return 1;
			}
			return 0;
		})
		.map(w => w.tag);
});

const otherTags = computed(() => {
	if (tags.length === 0) {
		return [];
	}

	const recommended = recommendedTags.value;

	if (!!content && content.length > 0) {
		let contentTags = [] as string[];
		for (const contentDocument of content) {
			contentTags.push(...contentDocument.getMarks('tag').map(i => i.attrs.tag));
		}
		return tags.filter(
			t => recommended!.indexOf(t) === -1 && contentTags!.indexOf(t) === -1
		);
	} else {
		return tags.filter(
			t =>
				recommended!.indexOf(t) === -1 &&
				lcText.value.split('#' + t.toLowerCase()).length - 1 === 0
		);
	}
});
</script>

<template>
	<div v-if="shouldShow">
		<slot />

		<div v-if="recommendedTags.length">
			<a
				v-for="tag of recommendedTags"
				:key="tag"
				class="badge -tag"
				@click="emit('tag', tag)"
			>
				#{{ tag }}
			</a>
		</div>

		<hr v-if="recommendedTags.length && otherTags.length" />

		<div v-if="otherTags.length">
			<a v-for="tag of otherTags" :key="tag" class="badge -tag" @click="emit('tag', tag)">
				#{{ tag }}
			</a>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-tag
	margin-right: 4px
</style>
