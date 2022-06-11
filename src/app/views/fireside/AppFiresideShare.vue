<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAbsoluteLink } from '../../../utils/router';
import AppShareCard from '../../../_common/share/card/AppShareCard.vue';
import { useFiresideController } from '../../components/fireside/controller/controller';

const { fireside } = useFiresideController()!;
const router = useRouter();

const shareUrl = computed(() => {
	if (!fireside) {
		return '';
	}
	return getAbsoluteLink(router, fireside.location);
});
</script>

<template>
	<AppShareCard resource="fireside" :url="shareUrl" />
</template>
