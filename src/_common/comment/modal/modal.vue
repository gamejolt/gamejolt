<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate
					v-if="displayMode === 'comments'"
					:translate-n="commentsCount"
					:translate-params="{ count: number(commentsCount) }"
					translate-plural="%{ count } comments"
				>
					1 comment
				</translate>
				<translate
					v-else
					:translate-n="commentsCount"
					:translate-params="{ count: number(commentsCount) }"
					translate-plural="%{ count } shouts"
				>
					1 shout
				</translate>
			</h2>
		</div>

		<div class="modal-body">
			<app-comment-widget
				:resource="resource"
				:resource-id="resourceId"
				:autofocus="autofocusAdd"
			/>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

>>> .timeline-list-item-split
	full-bleed()
</style>

<script lang="ts" src="./modal"></script>
