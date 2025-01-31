<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { AdAdapterComponentProps } from '../adapter-base';
import { AdProperAdapter, ProperTagPlacement } from './proper-adapter';

type Props = AdAdapterComponentProps<AdProperAdapter>;

const { adSlot, adapter } = defineProps<Props>();

const tagPlacement = ref<ProperTagPlacement | null>(null);
const tagUnit = ref<string | null>(null);
const tagId = ref<string | null>(null);
const tagClass = ref<string | null>(null);

if (adSlot.placement === 'top') {
	if (adSlot.size === 'leaderboard') {
		tagPlacement.value = 'leaderboard';
	} else {
		tagPlacement.value = 'content';
	}
} else if (adSlot.size === 'skyscraper') {
	tagPlacement.value = 'skyscraper';
	tagClass.value = 'sovrn-side-rail-dynamic';
} else {
	tagPlacement.value = adSlot.placement;
}

tagUnit.value = adapter.getTagUnit(tagPlacement.value);
if (tagUnit.value) {
	tagId.value = `gamejolt_${tagUnit.value}`;
}

onMounted(() => {
	if (!tagId.value) {
		return;
	}

	_doProperDisplay(tagId.value);
});

onBeforeUnmount(() => {
	if (!tagPlacement.value || !tagUnit.value || !tagId.value) {
		return;
	}

	adapter.releaseTagUnit(tagPlacement.value, tagUnit.value);
	_doProperDelete(tagId.value);

	tagPlacement.value = null;
	tagUnit.value = null;
	tagId.value = null;
});

function _doProperDisplay(tagId: string) {
	adapter.run(() => {
		(window as any).proper_display(tagId);
	});
}

function _doProperDelete(tagId: string) {
	adapter.run(() => {
		(window as any).properDestroyDfpSlot(tagId);
		(window as any).properDeleteSlot(tagId);
	});
}
</script>

<template>
	<div v-if="tagId" class="proper-ad-unit">
		<div :id="`proper-ad-${tagId}`" :class="tagClass" />
	</div>
</template>
