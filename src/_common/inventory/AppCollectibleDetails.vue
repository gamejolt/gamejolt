<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppCollectibleImg from './AppCollectibleImg.vue';
import {
	getCollectibleDisplayRarity,
	getCollectibleDisplayType,
	InventoryCollectible,
} from './collectible.model';

const props = defineProps({
	collectible: {
		type: Object as PropType<InventoryCollectible>,
		required: true,
	},
	doMaxWidth: {
		type: Boolean,
	},
});

const { collectible, doMaxWidth } = toRefs(props);
</script>

<template>
	<div>
		<div class="_top">
			<AppSpacer vertical :scale="2" />
			<div class="_img-container">
				<AppCollectibleImg :collectible="collectible" />
			</div>
			<AppSpacer vertical :scale="2" />
		</div>

		<div class="_details">
			<div class="_collectible-type text-center">
				{{ getCollectibleDisplayType(collectible.type) }}
			</div>

			<div v-if="collectible.is_unlocked">
				<div class="_collectible-name text-center">
					{{ collectible.name }}
				</div>
				<div class="text-center">
					<span
						class="_rarity"
						:class="{
							'_rarity-uncommon': collectible.rarity === 2,
							'_rarity-rare': collectible.rarity === 3,
							'_rarity-epic': collectible.rarity === 4,
						}"
					>
						{{ getCollectibleDisplayRarity(collectible.rarity) }}
					</span>
				</div>
				<div
					v-if="collectible.description"
					class="_description text-center"
					:class="{ '_description-max-width': doMaxWidth }"
				>
					<AppSpacer vertical :scale="2" />
					{{ collectible.description }}
				</div>
				<div v-else>
					<AppSpacer vertical :scale="1" />
				</div>
				<div v-if="collectible.type === 'Sticker'">
					<AppSpacer vertical :scale="2" />
					<hr />
					TODO: Sticker mastery progress
				</div>
			</div>
			<div v-else class="text-center">
				<AppSpacer vertical :scale="4" />
				<AppJolticon icon="lock" />
				<i>{{ $gettext(`This collectible is locked`) }}</i>
				<AppSpacer vertical :scale="2" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size = $font-size-small

._top
	change-bg('bg')

._img-container
	width: 100%
	display: flex
	justify-content: center

._details
	padding: 4px

._collectible-type
	font-size: $-font-size
	text-transform: uppercase
	color: var(--theme-fg-muted)

._collectible-name
	font-family: 'Germania'
	font-size: 28px

._description
	font-size: $-font-size
	color: var(--theme-fg-muted)

._description-max-width
	max-width: 300px
	padding-left: 4px
	padding-right: 4px

._rarity
	font-size: $-font-size
	change-bg('dark')
	padding: 4px 6px
	rounded-corners()
	font-weight: bold
	color: white

._rarity-uncommon
	color: #1bb804

._rarity-rare
	color: #18a5f2

._rarity-epic
	color: #ffbc56
</style>
