<template>
	<span class="client-game-buttons">
		<span v-if="!localPackage" v-app-tooltip="installTooltip" style="display: inline-block">
			<app-button
				primary
				solid
				icon="download-box"
				:disabled="!canInstall"
				:overlay="overlay"
				:sm="small"
				:lg="large"
				@click.stop="install()"
			>
				<translate>Install</translate>
			</app-button>
		</span>

		<template v-else>
			<!-- If we're installing -->
			<span v-if="localPackage.install_state || localPackage.update_state">
				<template v-if="localPackage.didInstallFail || localPackage.didUpdateFail">
					<span class="tag tag-notice">
						{{
							localPackage.didInstallFail
								? $gettext('Installation Failed')
								: $gettext('Update Failed')
						}}
					</span>
					<app-button
						primary
						:overlay="overlay"
						:sm="small"
						:lg="large"
						@click.stop="retryInstall()"
					>
						<translate>Retry</translate>
					</app-button>
				</template>

				<app-client-install-progress v-if="!noProgress" :local-package="localPackage" />

				<template v-if="localPackage.isPatching">
					<template v-if="localPackage.isPatchQueued">
						<translate class="tag">QUEUED</translate>
					</template>

					<template v-else-if="localPackage.isUpdating">
						<translate class="tag tag-highlight">UPDATING</translate>
					</template>

					<template v-else-if="!localPackage.isPatchQueued">
						<template v-if="!localPackage.isPatchPaused">
							<app-button :overlay="overlay" :sm="small" :lg="large" @click.stop="pause()">
								<translate v-if="!small">Pause</translate>
							</app-button>
						</template>

						<template v-else>
							<app-button primary :overlay="overlay" :sm="small" :lg="large" @click.stop="resume()">
								<translate v-if="!small">Resume</translate>
							</app-button>
						</template>
					</template>
				</template>

				<app-button
					v-if="localPackage.install_state"
					circle
					icon="remove"
					:trans="!overlay"
					:overlay="overlay"
					:sm="small"
					:lg="large"
					@click.stop="cancel()"
					v-app-tooltip="$gettext('Cancel Installation')"
				/>
			</span>

			<span v-if="localPackage.isSettled">
				<!--
				Single game launching.
			-->
				<template v-if="gamePackages.length === 1">
					<app-button
						v-if="!localPackage.isRunning"
						primary
						solid
						icon="play"
						:overlay="overlay"
						:sm="small"
						:lg="large"
						@click.stop="launch(localPackage)"
						v-app-tooltip="
							$gettext(localPackage.isRunning ? 'This game is currently running.' : undefined)
						"
					>
						<translate>Launch</translate>
					</app-button>
				</template>

				<!--
				Multi game launching.
			-->
				<app-popper
					v-if="gamePackages.length > 1"
					@show="$emit('show-launch-options', $event)"
					@hide="$emit('hide-launch-options', $event)"
				>
					<app-button primary solid icon="play" :overlay="overlay" :sm="small" :lg="large">
						<translate>Launch</translate>
					</app-button>

					<div slot="popover" class="list-group list-group-dark thin">
						<a
							v-for="pkg of settledGamePackages"
							:key="`launch-${pkg.id}`"
							class="list-group-item has-icon"
							:class="{
								disabled: pkg.isRunning,
							}"
							@click="launch(pkg)"
						>
							<app-jolticon icon="play" />
							{{ pkg.title || game.title }}
						</a>
					</div>
				</app-popper>
			</span>

			<app-popper
				v-if="!localPackage.install_state"
				@show="$emit('show-options', $event)"
				@hide="$emit('hide-options', $event)"
			>
				<app-button
					circle
					icon="ellipsis-v"
					:trans="!overlay"
					:overlay="overlay"
					:sm="small"
					:lg="large"
				/>

				<div slot="popover" class="list-group list-group-dark thin">
					<router-link
						class="list-group-item has-icon"
						:to="{
							name: 'discover.games.view.overview',
							params: {
								slug: game.slug,
								id: game.id,
							},
						}"
					>
						<app-jolticon icon="game" />
						<translate>View Game</translate>
					</router-link>
					<a
						v-for="pkg of settledGamePackages"
						:key="`open-folder-${pkg.id}`"
						class="list-group-item has-icon"
						@click="openFolder(pkg)"
					>
						<app-jolticon icon="folder-open" />
						<span v-translate="{ title: pkg.title || game.title }">
							Open Folder for %{ title }
						</span>
					</a>
					<a
						v-for="pkg of uninstallableGamePackages"
						:key="`uninstall-${pkg.id}`"
						class="list-group-item has-icon"
						:class="{
							disabled: pkg.isRunning,
						}"
						@click="uninstallPackage(pkg)"
					>
						<app-jolticon icon="remove" notice />
						<span v-translate="{ title: pkg.title || game.title }">
							Uninstall %{ title }
						</span>
					</a>
				</div>
			</app-popper>
		</template>
	</span>
</template>

<script lang="ts" src="./game-buttons"></script>
