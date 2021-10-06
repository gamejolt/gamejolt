<script lang="ts" src="./time"></script>

<template>
	<router-link :to="link" class="link-unstyled">
		<template v-if="post.isScheduled">
			<span class="tag" style="vertical-align: middle">
				<app-jolticon icon="calendar-grid" />
				<translate>Scheduled</translate>
			</span>
			<app-time-ago :date="post.scheduled_for" strict without-suffix />
		</template>
		<template v-else>
			<app-time-ago :date="date" strict without-suffix />
		</template>
	</router-link>
</template>
