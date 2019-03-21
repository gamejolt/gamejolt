<template>
	<component :is="link ? 'router-link' : 'span'" :to="link" :class="link ? 'link-unstyled' : ''">
		<template v-if="shouldShowScheduled">
			<span class="tag" style="vertical-align: middle">
				<app-jolticon icon="calendar-grid" />
				<translate>Scheduled</translate>
			</span>
			<app-time-ago :date="post.scheduled_for" strict without-suffix />
		</template>
		<template v-else>
			<app-time-ago :date="eventItem.added_on" strict without-suffix />
		</template>
	</component>
</template>

<script lang="ts" src="./time" />
