<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { setDrawerOpen, useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideCohostManage from '../cohost/manage/manage.vue';
import AppFiresideHostThumb from '../_host-thumb/host-thumb.vue';
import AppFiresideStreamOptions from '../_stream-options/stream-options.vue';
import AppFiresideStreamPlayback from '../_stream-playback/stream-playback.vue';
import AppFiresideHostListStickerButton from './sticker-button/sticker-button.vue';

@Options({
	components: {
		AppFiresideHostThumb,
		AppScrollScroller,
		AppFiresideStreamOptions,
		AppFiresideCohostManage,
		AppFiresideHostListStickerButton,
		AppFiresideStreamPlayback,
	},
	directives: {
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppFiresideHostList extends Vue {
	@Prop({ type: Boolean })
	hideThumbOptions!: boolean;

	@Prop({ type: Boolean })
	showPlayback!: boolean;

	c = shallowSetup(() => useFiresideController()!);

	drawerStore = shallowSetup(() => useDrawerStore());

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get canPlaceStickers() {
		return !!this.c.user.value && !Screen.isMobile;
	}

	get canManageCohosts() {
		return this.c.canManageCohosts.value;
	}

	onClickStickerButton() {
		setDrawerOpen(this.drawerStore, true);
	}
}
</script>

<template>
	<AppScrollScroller v-if="c.rtc.value" class="-fireside-hosts" horizontal>
		<div class="-fireside-hosts-inner">
			<AppFiresideStreamPlayback v-if="showPlayback" />

			<AppFiresideStreamOptions @show-popper="emitShowPopper" @hide-popper="emitHidePopper" />

			<AppFiresideCohostManage v-if="canManageCohosts" />

			<AppFiresideHostThumb
				v-for="host of c.rtc.value.users"
				:key="host.uid"
				class="-host-thumb"
				:host="host"
				:hide-options="hideThumbOptions"
				@show-popper="emitShowPopper"
				@hide-popper="emitHidePopper"
			/>

			<AppFiresideHostListStickerButton
				v-if="canPlaceStickers"
				v-app-auth-required
				@click="onClickStickerButton"
			/>
		</div>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-fireside-hosts
	--fireside-host-size: 100px
	--fireside-host-gap: 8px
	width: 100%

	@media $media-mobile
		--fireside-host-size: 60px
		--fireside-host-gap: 4px

	&-inner
		display: inline-flex
		justify-content: center
		grid-gap: var(--fireside-host-gap)
		height: var(--fireside-host-size)

.-host-thumb
	flex: none
</style>
