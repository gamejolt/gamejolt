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
					:translate-n="supporterCount"
					:translate-params="{ count: number(supporterCount) }"
					translate-plural="%{ count } supporters"
				>
					1 supporter
				</translate>
			</h2>
			<p>
				<translate>The kind people that supported by paying more than the minimum.</translate>
			</p>
		</div>

		<div class="modal-body">
			<app-user-list :users="users" />

			<app-loading v-if="isLoading" centered />

			<div v-if="shouldShowLoadMore" class="page-cut">
				<app-button trans @click="loadMore()">
					<translate>Load More</translate>
				</app-button>
			</div>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal" />
