<template>
	<span class="client-package-card-meta" v-if="localPackage">
		<template v-if="localPackage.isInstalling">
			<template v-if="!localPackage.isPatchPaused">
				<translate class="tag tag-highlight text-upper" v-if="localPackage.isInstalling">
					Installing
				</translate>
				<translate class="tag tag-notice text-upper" v-else-if="localPackage.didInstallFail">
					Install Failed
				</translate>
			</template>
			<template v-else>
				<translate class="tag text-upper">Install Paused</translate>
			</template>
		</template>
		<template v-else-if="localPackage.isUpdating">
			<template v-if="!localPackage.isPatchPaused">
				<translate class="tag tag-highlight text-upper" v-if="localPackage.isUpdating">
					Updating
				</translate>
				<translate class="tag tag-notice text-upper" v-else-if="localPackage.didUpdateFail">
					Update Failed
				</translate>
			</template>
			<template v-else>
				<translate class="tag text-upper">Update Paused</translate>
			</template>
		</template>
		<template v-else-if="localPackage.isSettled">
			<translate class="tag text-upper" v-if="!localPackage.isRunning">Installed</translate>
			<translate class="tag tag-highlight text-upper" v-else>Running</translate>
		</template>
		<translate class="tag text-upper" v-else-if="localPackage.isRemoving">Removing</translate>
		<translate class="tag tag-notice text-upper" v-else>Failed</translate>

		<span class="dot-separator"></span>
	</span>
</template>

<script lang="ts" src="./package-card-meta" />
