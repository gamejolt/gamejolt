<template>
	<div class="row">
		<div class="hidden-xs col-sm-4 col-sm-push-8">
			<div class="page-help">
				<h4>Writing a Good Description</h4>
				<p>
					<translate>
						A good description generally contains things like a gameplay summary, control overview,
						story, credits, etc. You can edit your description whenever you want and add to it over
						time.
					</translate>
				</p>
				<p>
					<translate>
						You can also upload images to use as in-context shots for your game or for stylized
						headings.
					</translate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<form-game-description :model="game" :tags="tags" @submit="onSaved" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
h4
	margin-top: 0
</style>

<script lang="ts" src="./description"></script>
