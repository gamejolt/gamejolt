<template>
	<div
		class="timeline-list-item"
		:class="{
			new: isNew,
			active: isActive,
			'is-thread': isThread,
			'is-last': isLast,
		}"
	>
		<div class="timeline-list-item-connector" />

		<div v-if="!!$slots.bubble" class="timeline-list-item-bubble">
			<div class="timeline-list-item-bubble-inner">
				<slot name="bubble" />
			</div>
		</div>

		<div class="timeline-list-item-main">
			<slot />
		</div>
	</div>
</template>

<script lang="ts" src="./item"></script>
