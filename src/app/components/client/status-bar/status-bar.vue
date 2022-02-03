<script lang="ts">
import { Options, Vue, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { ClientUpdater } from '../../../../_common/client/client-updater.service';
import { Client } from '../../../../_common/client/client.service';
import { formatNumber } from '../../../../_common/filters/number';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useClientLibraryStore } from '../../../store/client-library/index';
import AppClientStatusBarPatchItem from './patch-item/patch-item.vue';

@Options({
	components: {
		AppClientStatusBarPatchItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppClientStatusBar extends Vue {
	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	// @ClientLibraryState
	// numPlaying!: ClientLibraryStore['numPlaying'];
	numPlaying: any = 0;

	// @ClientLibraryState
	// currentlyPlaying!: ClientLibraryStore['currentlyPlaying'];
	currentlyPlaying: any = [];

	updaterWarningDismissed = false;

	readonly formatNumber = formatNumber;

	get clientUpdateStatus() {
		return ClientUpdater.clientUpdateStatus;
	}

	get isShowing() {
		return (
			this.numPatching > 0 || this.numPlaying > 0 || this.hasUpdate || this.showUpdaterIssue
		);
	}

	get numPatching() {
		return this.clientLibrary.numPatching.value;
	}

	get currentlyPlayingList() {
		return this.currentlyPlaying
			.map(i => this.clientLibrary.gamesById.value[i.game_id].title)
			.join(', ');
	}

	get currentlyPatchingIds() {
		return Object.keys(this.clientLibrary.currentlyPatching.value).map(i => parseInt(i, 10));
	}

	get hasUpdate() {
		return this.clientUpdateStatus === 'ready';
	}

	get showUpdaterIssue() {
		return this.clientUpdateStatus === 'error' && !this.updaterWarningDismissed;
	}

	dismissUpdaterWarning() {
		this.updaterWarningDismissed = true;
	}

	async updateClient() {
		await ClientUpdater.updateClient();
	}

	@Watch('isShowing', { immediate: true })
	onIsShowingChanged() {
		if (this.isShowing) {
			document.body.classList.add('has-hot-bottom');
		} else {
			document.body.classList.remove('has-hot-bottom');
		}
	}

	unmounted() {
		document.body.classList.remove('has-hot-bottom');
	}

	updateApply() {
		this.updateClient();
	}

	quitClient() {
		Client.quit();
	}
}
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

			<router-link
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
			</router-link>
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
