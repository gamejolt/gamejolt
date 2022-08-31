<script lang="ts" setup>
import { PropType } from 'vue';
import AppRealmFullCard from '../../../../../_common/realm/AppRealmFullCard.vue';
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

		<div class="-grid">
			<template v-for="realm of realms" :key="realm.id">
				<AppRealmFullCard
					:ratio="3.5"
					media-item-type="header"
					:realm="realm"
					overlay-content
					no-sheet
					:to="realm.routeLocation"
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-grid
	--grid-cols: 2
	gap: 24px
	display: grid
	grid-template-columns: repeat(var(--grid-cols), 1fr)
	justify-content: center

	@media $media-xs
		--grid-cols: 1
		gap: 16px
</style>
