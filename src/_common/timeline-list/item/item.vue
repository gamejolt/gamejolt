<template>
	<div class="timeline-list-item">
		<div
			v-if="!!$slots.bubble"
			class="timeline-list-item-bubble"
			:class="{
				new: isNew,
				active: isActive,
			}"
		>
			<div class="timeline-list-item-bubble-inner">
				<slot name="bubble" />
			</div>
		</div>

		<div
			class="timeline-list-item-main"
			:class="{
				new: isNew,
				active: isActive,
				'is-thread': isThread,
				'is-last': isLast,
			}"
		>
			<slot />
		</div>
	</div>
</template>

<script lang="ts" src="./item"></script>
