<template>
	<div class="client-install-progress" v-if="packageProgress">
		<p class="client-install-progress-info client-install-progress-info-percent text-center small">
			<strong>{{ ((packageProgress.progress || 0) * 100.0).toFixed(0) }}%</strong>
		</p>

		<app-progress-bar
			thin
			:percent="(packageProgress.progress || 0) * 100.0"
			:indeterminate="localPackage.isUnpacking"
			:active="localPackage.isUnpacking"
			role="progressbar"
			:aria-valuenow="((packageProgress.progress || 0) * 100.0).toFixed(0)"
			aria-valuemin="0"
			aria-valuemax="100"
		/>

		<p class="client-install-progress-info small clearfix">
			<span class="pull-left client-install-progress-info-speed" v-if="shouldShowSpeed">
				<span v-translate="{ speed }">
					Speed:
					<strong>%{ speed }</strong>
				</span>
			</span>
			<span class="pull-right client-install-progress-info-time">
				<span v-translate="{ timeLeft }">
					Remaining:
					<strong>%{ timeLeft }</strong>
				</span>
			</span>
		</p>
	</div>
</template>

<script lang="ts" src="./install-progress"></script>
