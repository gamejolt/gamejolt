<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ClientUpdater } from '../../../../_common/client/client-updater.service';
import { Client } from '../../../../_common/client/client.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useClientLibraryStore } from '../../../store/client-library/index';
import AppClientStatusBarPatchItem from './AppClientStatusBarPatchItem.vue';

const { gamesById, numPatching, currentlyPatching, currentlyPlaying } = useClientLibraryStore();

const updaterWarningDismissed = ref(false);

const numPlaying = computed(() => currentlyPlaying.value.length);
const clientUpdateStatus = computed(() => ClientUpdater.clientUpdateStatus);
const hasUpdate = computed(() => clientUpdateStatus.value === 'ready');

const currentlyPlayingList = computed(() =>
	currentlyPlaying.value.map(i => gamesById.value[i.game_id]?.title ?? 'game').join(', ')
);

const currentlyPatchingIds = computed(() =>
	Object.keys(currentlyPatching.value).map(i => parseInt(i, 10))
);

const showUpdaterIssue = computed(
	() => clientUpdateStatus.value === 'error' && !updaterWarningDismissed.value
);

const isShowing = computed(
	() => numPatching.value > 0 || numPlaying.value > 0 || hasUpdate.value || showUpdaterIssue.value
);

function dismissUpdaterWarning() {
	updaterWarningDismissed.value = true;
}

async function updateClient() {
	await ClientUpdater.updateClient();
}

watch(
	isShowing,
	isShowing => {
		if (isShowing) {
			document.body.classList.add('has-hot-bottom');
		} else {
			document.body.classList.remove('has-hot-bottom');
		}
	},
	{ immediate: true }
);

onUnmounted(() => {
	document.body.classList.remove('has-hot-bottom');
});
</script>

<template>
	<div
		class="status-bar fill-darker clearfix"
		:class="{
			'-is-showing': isShowing,
		}"
	>
		<div class="pull-left">
			<div v-if="numPlaying > 0" class="-item">
				<AppJolticon icon="play" />
				<AppTranslate>Currently Playing:</AppTranslate>
				<strong :title="currentlyPlayingList">
					{{ currentlyPlayingList }}
				</strong>
			</div>

			<RouterLink
				v-if="numPatching > 0"
				v-app-tooltip="$gettext(`View Downloads`)"
				class="-item link-unstyled"
				:to="{ name: 'library.installed' }"
			>
				<AppTranslate
					:translate-n="numPatching || 0"
					:translate-params="{ count: formatNumber(numPatching || 0) }"
					translate-plural="%{ count } Downloads"
				>
					%{ count } Download
				</AppTranslate>
				&nbsp;
				<div class="-progress">
					<AppClientStatusBarPatchItem
						v-for="packageId of currentlyPatchingIds"
						:key="packageId"
						:package-id="packageId"
					/>
				</div>
			</RouterLink>
		</div>

		<div class="pull-right">
			<div v-if="hasUpdate || showUpdaterIssue" class="-item">
				<b>
					<template v-if="hasUpdate">
						<AppTranslate>New Client version available!</AppTranslate>
						{{ ' ' }}
						<a @click="updateClient()">
							<AppTranslate>Update now</AppTranslate>
						</a>
					</template>
					<template v-else>
						<AppTranslate>Uh oh, client has trouble updating!</AppTranslate>
						{{ ' ' }}
						<a class="-notice" @click="Client.quit()">
							<AppJolticon notice icon="notice" />
							<AppTranslate>Try restarting</AppTranslate>
						</a>
						{{ ' ' }}
						<a class="-dismiss" @click="dismissUpdaterWarning()">
							<AppJolticon class="-dismiss" icon="remove" />
						</a>
					</template>
				</b>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.status-bar
	position: absolute
	padding: 0 10px
	height: $status-bar-height
	line-height: @height
	font-size: $font-size-tiny
	bottom: -($status-bar-height)
	width: 100%
	transition: bottom 250ms $strong-ease-out

	&.-is-showing
		bottom: 0

	.jolticon
		vertical-align: middle

.-progress
	display: inline-block
	width: 200px

.-item
	text-overflow()
	float: left
	margin-right: 30px
	max-width: 350px

	.pull-right &
		margin-right: 0
		margin-left: 30px

	.jolticon
		margin-top: -5px

.-notice
	theme-prop('color', 'notice')

.-dismiss
	theme-prop('color', 'white')
</style>
