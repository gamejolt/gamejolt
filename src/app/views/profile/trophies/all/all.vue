<script lang="ts" src="./all"></script>

<template>
	<div>
		<div v-if="!hasTrophies" class="alert alert-info">
			<span>
				<translate>This user has not achieved any trophies...yet.</translate>
			</span>
		</div>

		<app-trophy-list-paged v-else :initial-trophies="trophies" :url="listLoadMoreUrl" />
	</div>
</template>
