<template>
	<div class="-item">
		<div class="-pressy">
			<app-community-thumbnail-img
				class="-img"
				:style="{
					'border-color': community.is_member ? highlight : '',
				}"
				:community="community"
				@click.native="toggleJoin"
			/>

			<div v-if="community.is_member" class="-followed">
				<div
					:style="{
						'background-color': highlight,
					}"
				>
					<app-jolticon class="-icon" icon="check" />
				</div>
			</div>
		</div>

		<div class="-name text-muted">
			{{ community.name }}
		</div>
	</div>
</template>

<style lang="stylus" src="./community-item.styl" scoped></style>

<script lang="ts" src="./community-item"></script>
