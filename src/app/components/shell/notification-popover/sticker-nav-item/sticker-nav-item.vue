<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppTimelineListItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellNotificationPopoverStickerNavItem extends Vue {
	@Prop({ type: Number, required: true }) stickerCount!: number;
	@Prop({ type: Boolean, required: true }) hasNew!: boolean;

	readonly formatNumber = formatNumber;
}
</script>

<template>
	<div>
		<router-link :to="{ name: 'dash.stickers' }">
			<div class="-item">
				<AppTimelineListItem>
					<template #bubble>
						<div class="-icon-container">
							<AppJolticon icon="sticker" :big="hasNew" :highlight="hasNew" />
						</div>
					</template>

					<div class="timeline-list-item-title timeline-list-item-title-small -title">
						<AppTranslate
							:translate-n="stickerCount"
							:translate-params="{ count: formatNumber(stickerCount) }"
							translate-plural="You have %{ count } stickers."
						>
							You have %{ count } sticker.
						</AppTranslate>
					</div>
				</AppTimelineListItem>

				<div v-if="hasNew" class="-actions">
					<span v-app-tooltip="$gettext(`View newly unlocked stickers`)" class="-icon" />
				</div>
			</div>
		</router-link>

		<div class="timeline-list-item-split" />
	</div>
</template>

<style lang="stylus" scoped>
.-item
	display: flex
	justify-content: space-between
	margin-bottom: 8px

.-icon-container
	position: absolute
	width: 100%
	height: 100%
	top: 0
	left: 0
	display: flex
	justify-content: center
	align-items: center

.-icon
	display: block
	width: 12px
	height: 12px
	border-radius: 50%
	background-color: var(--theme-highlight)
	margin-right: 4px

.-actions
	margin-top: 18px
	margin-left: 10px

.-title
	margin-top: 14px
</style>
