<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import { ContentDocument } from '../../content/content-document';

const props = defineProps({
	tags: {
		type: Array as PropType<string[]>,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	content: {
		type: Array as PropType<ContentDocument[]>,
		required: true,
	},
});

const emit = defineEmits({
	tag: (_tag: string) => true,
});

const { tags, text, content } = toRefs(props);

const shouldShow = toRef(
	() => tags.value.length && recommendedTags.value.length + otherTags.value.length > 0
);

const lcText = computed(() => {
	let newText = '';
	if (text.value) {
		newText += text.value.toLowerCase();
	}
	if (!!content?.value && content.value.length > 0) {
		for (const contentDocument of content.value) {
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
	if (tags.value.length === 0) {
		return [];
	}

	return tags.value
		.map(t => {
			const count = lcText.value.split(t.toLowerCase()).length - 1;
			let hashtagCount = 0;
			if (!!content?.value && content.value.length > 0) {
				for (const contentDocument of content.value) {
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
	if (tags.value.length === 0) {
		return [];
	}

	const recommended = recommendedTags.value;

	if (!!content?.value && content.value.length > 0) {
		let contentTags = [] as string[];
		for (const contentDocument of content.value) {
			contentTags.push(...contentDocument.getMarks('tag').map(i => i.attrs.tag));
		}
		return tags.value.filter(
			t => recommended!.indexOf(t) === -1 && contentTags!.indexOf(t) === -1
		);
	} else {
		return tags.value.filter(
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
