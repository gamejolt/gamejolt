<script lang="ts" setup>
import AppRealmFullCard from '../../../../../_common/realm/AppRealmFullCard.vue';
import { RealmModel } from '../../../../../_common/realm/realm-model';

type Props = {
	realms: RealmModel[];
	isLoading?: boolean;
	gridColumnsDesktop?: number;
	gridColumnsSm?: number;
	gridColumnsXs?: number;
};
const {
	realms,
	gridColumnsDesktop = 4,
	gridColumnsSm = 3,
	gridColumnsXs = 2,
} = defineProps<Props>();
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
