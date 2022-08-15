<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import { Minbar, MinbarItem } from './minbar.service';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppMinbar extends Vue {
	readonly Minbar = Minbar;
	readonly Screen = Screen;

	onItemClick(item: MinbarItem) {
		if (item.onClick) {
			item.onClick();
		}
	}
}
</script>

<template>
	<div class="minbar">
		<div class="minbar-items">
			<transition v-for="(item, index) of Minbar.items" :key="index">
				<a
					class="minbar-item anim-fade-enter-up anim-fade-leave-shrink"
					:class="{ active: item.isActive }"
					@click="onItemClick(item)"
				>
					<transition>
						<span
							v-if="item.notificationCount"
							class="tag tag-highlight notification-tag anim-fade-enter anim-fade-leave"
						>
							{{ item.notificationCount }}
						</span>
					</transition>

					<div v-app-tooltip="item.title" class="minbar-item-thumb">
						<img class="img-responsive" :src="item.thumb" alt="" />
					</div>
				</a>
			</transition>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.minbar
	clearfix()

	&-items
		float: right
		margin-right: $minbar-offset-right + 20px

	&-item
		change-bg('darker')
		display: inline-block
		position: relative
		padding: $minbar-padding
		border: $minbar-border-width solid $white
		margin-right: ($minbar-spacing - ($minbar-border-width * 2))
		margin-bottom: @margin-right
		// Many times minbar items will come into view by clicking minimize on something.
		// We want to give the view time to change and let the element animate out before
		// sliding the minbar item up.
		animation-delay: 300ms

		&.active
			change-bg('highlight')

		> .notification-tag
			position: absolute
			top: 0
			right: 0

	&-item-thumb > img
		max-height: 50px
</style>
