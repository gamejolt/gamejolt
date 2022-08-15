<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from '../../../../../_common/realm/realm-model';
import AppRealmChunk from '../../../../../_common/realm/chunk/AppRealmChunk.vue';

defineProps({
	realms: {
		type: Array as PropType<Realm[]>,
		required: true,
	},
	isLoading: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="container">
		<template v-for="realm of realms" :key="realm.id">
			<AppRealmChunk class="-chunk" :realm="realm" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-chunk
	margin-bottom: 48px
</style>
