<template>
	<section class="section">
		<div class="container">
			<div v-if="token">
				<p><translate>Please use your web browser to complete the process.</translate></p>

				<app-progress-poller
					:url="`/web/auth/poll-oauth/${token}`"
					:interval="2500"
					@complete="completed"
					@error="failed"
				/>

				<app-loading :label="$gettext('Linking...')" />
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./linking"></script>
