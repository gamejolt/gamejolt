<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, toRefs } from 'vue';
import { defineAdAdapterComponentProps } from '../adapter-base';
import { AdProperAdapter, ProperTagPlacement } from './proper-adapter';

const props = defineProps({
	...defineAdAdapterComponentProps<AdProperAdapter>(),
});

const tagPlacement = ref<ProperTagPlacement | null>(null);
const tagUnit = ref<string | null>(null);
const tagId = ref<string | null>(null);

const { placement, size } = toRefs(props.adSlot);
if (placement.value === 'top') {
	if (size.value === 'leaderboard') {
		tagPlacement.value = 'leaderboard';
	} else {
		tagPlacement.value = 'content';
	}
} else {
	tagPlacement.value = placement.value;
}

tagUnit.value = props.adapter.getTagUnit(tagPlacement.value);
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

	props.adapter.releaseTagUnit(tagPlacement.value, tagUnit.value);
	_doProperDelete(tagId.value);

	tagPlacement.value = null;
	tagUnit.value = null;
	tagId.value = null;
});

function _doProperDisplay(tagId: string) {
	props.adapter.run(() => {
		(window as any).proper_display(tagId);
	});
}

function _doProperDelete(tagId: string) {
	props.adapter.run(() => {
		(window as any).properDestroyDfpSlot(tagId);
		(window as any).properDeleteSlot(tagId);
	});
}
</script>

<template>
	<div v-if="tagId" class="proper-ad-unit">
		<div :id="`proper-ad-${tagId}`" />
	</div>
</template>
