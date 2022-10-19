<script lang="ts" setup>
import { computed } from 'vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideBottomBarHost from './AppFiresideBottomBarHost.vue';
import AppFiresideBottomBarHostAvatar from './AppFiresideBottomBarHostAvatar.vue';

const emit = defineEmits({
	streamSettings: () => true,
});

const c = useFiresideController()!;
const { rtc, isPersonallyStreaming, isStreamingElsewhere, canStream, focusedUser } = c;

const listableStreamingUsers = computed(() => rtc.value?.listableStreamingUsers ?? []);
</script>

<template>
	<div class="bottom-bar-hosts">
		<div class="-hosts">
			<div
				v-if="!isPersonallyStreaming && !isStreamingElsewhere && canStream && rtc?.producer"
			>
				<a
					v-app-tooltip="$gettext(`Click to open stream settings`)"
					class="-host-thumb"
					@click="emit('streamSettings')"
				>
					<div class="-host-thumb-producer">
						<AppFiresideBottomBarHostAvatar :host="rtc.producer" />
					</div>
				</a>
			</div>

			<!-- Only render these out when we have a focused user. If we don't
			do this, we could have a conflict with the video preview and the
			primary video stream trying to play at the same time (showing a gray
			screen). -->
			<template v-if="focusedUser">
				<AppFiresideBottomBarHost
					v-for="host of listableStreamingUsers"
					:key="host.uid"
					class="-host-thumb"
					:host="host"
				/>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.bottom-bar-hosts
	--fireside-host-size: 64px
	--fireside-host-gap: 8px
	width: 100%
	// This extra padding is so that the shadows of the floating avatars don't
	// get cut off
	padding: 4px 4px 0 4px

.-hosts
	display: inline-flex
	justify-content: center
	grid-gap: var(--fireside-host-gap)
	height: var(--fireside-host-size)

.-host-thumb
	flex: none

.-host-thumb-producer
	width: var(--fireside-host-size)
	height: var(--fireside-host-size)
	filter: grayscale(0.75)
	opacity: 0.5
</style>
