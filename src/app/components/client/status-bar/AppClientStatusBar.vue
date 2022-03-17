<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ClientUpdater } from '../../../../_common/client/client-updater.service';
import { Client } from '../../../../_common/client/client.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useClientLibraryStore } from '../../../store/client-library/index';
import AppClientStatusBarPatchItem from './AppClientStatusBarPatchItem.vue';

const { gamesById, numPatching, currentlyPatching } = useClientLibraryStore();

const updaterWarningDismissed = ref(false);

// TODO(vue3): these values were pulled from the client library before... where is the data?
const numPlaying = computed(() => 0);
const currentlyPlaying = computed(() => [] as any[]);

const clientUpdateStatus = computed(() => ClientUpdater.clientUpdateStatus);

const currentlyPlayingList = computed(() =>
	currentlyPlaying.value.map(i => gamesById.value[i.game_id]?.title ?? 'game').join(', ')
);

const currentlyPatchingIds = computed(() =>
	Object.keys(currentlyPatching.value).map(i => parseInt(i, 10))
);

const hasUpdate = computed(() => clientUpdateStatus.value === 'ready');

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

function updateApply() {
	updateClient();
}

function quitClient() {
	Client.quit();
}

onMounted(() => {
	document.body.classList.remove('has-hot-bottom');
});

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
						<a @click="updateApply()">
							<AppTranslate>Update now</AppTranslate>
						</a>
					</template>
					<template v-else>
						<AppTranslate>Uh oh, client has trouble updating!</AppTranslate>
						<a class="-notice" @click="quitClient()">
							<AppJolticon notice icon="notice" />
							<AppTranslate>Try restarting</AppTranslate>
						</a>
						&nbsp;
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
	padding: 0 10px
	height: $status-bar-height
	line-height: @height
	font-size: $font-size-tiny
	transform: translateY($status-bar-height)
	transition: transform 250ms $strong-ease-out

	&.-is-showing
		transform: translateY(0)

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
