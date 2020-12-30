<script lang="ts" src="./competitions"></script>

<template>
	<app-communities-view-page-container>
		<app-community-perms :community="community" required="community-competitions">
			<h2 class="section-header">
				<translate>Jams</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						TODO: Put proper text here. Explaining that each Jam is connected to a
						channel, and to delete it, delete the channel, etc.
					</translate>
				</p>
			</div>
		</app-community-perms>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped></style>
