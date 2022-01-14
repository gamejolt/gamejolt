<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Game } from '../../../../_common/game/game.model';
import AppPopper from '../../../../_common/popper/popper.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppGamePlaylistAddToPopover from '../add-to-popover/add-to-popover.vue';

@Options({
	components: {
		AppPopper,
		AppGamePlaylistAddToPopover,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppGamePlaylistAddToWidget extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	isShown = false;

	readonly Game = Game;
}
</script>

<template>
	<app-popper
		v-if="game.isVisible"
		popover-class="fill-darkest"
		placement="bottom"
		@show="isShown = true"
		@hide="isShown = false"
	>
		<app-button
			v-app-auth-required
			v-app-tooltip.bottom="$gettext('Add to Playlist')"
			v-app-track-event="`add-to-playlist:widget:${eventLabel}`"
			icon="add"
			sparse
			:overlay="overlay"
			:circle="circle"
		/>

		<template v-if="isShown" #popover>
			<app-game-playlist-add-to-popover :game="game" />
		</template>
	</app-popper>
</template>
