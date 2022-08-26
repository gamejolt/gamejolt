<script lang="ts" setup>
import { PropType } from 'vue';
import AppRealmChunk from '../../../../../_common/realm/chunk/AppRealmChunk.vue';
import { Realm } from '../../../../../_common/realm/realm-model';

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
		<slot name="header" />

		<template v-for="(realm, index) of realms" :key="realm.id">
			<AppRealmChunk
				:class="{
					'-chunk-pad': index < realms.length - 1,
				}"
				:realm="realm"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-chunk-pad
	margin-bottom: 48px
</style>
