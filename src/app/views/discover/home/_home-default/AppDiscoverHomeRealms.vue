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
	gridColumnsDesktop: {
		type: Number,
		default: 4,
	},
	gridColumnsSm: {
		type: Number,
		default: 3,
	},
	gridColumnsXs: {
		type: Number,
		default: 2,
	},
});
</script>

<template>
	<div class="container">
		<slot name="header" />

		<div
			class="-grid"
			:style="[
				`--col-desktop: ${gridColumnsDesktop}`,
				`--col-sm: ${gridColumnsSm}`,
				`--col-xs: ${gridColumnsXs}`,
			]"
		>
			<template v-for="realm of realms" :key="realm.id">
				<AppRealmFullCard
					:realm="realm"
					:to="realm.routeLocation"
					label-position="bottom-left"
					overlay-content
					no-sheet
					no-follow
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-grid
	--grid-cols: var(--col-desktop)
	gap: 24px
	display: grid
	grid-template-columns: repeat(var(--grid-cols), 1fr)
	justify-content: center

	@media $media-sm
		--grid-cols: var(--col-sm)
		gap: 24px

	@media $media-xs
		--grid-cols: var(--col-xs)
		gap: 16px
</style>
