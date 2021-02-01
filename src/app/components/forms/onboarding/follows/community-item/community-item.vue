<script lang="ts" src="./community-item"></script>

<template>
	<div class="-item">
		<div class="-pressy">
			<div class="-wrapper">
				<app-community-thumbnail-img
					class="-img"
					:style="{
						'border-color': community.is_member ? highlight : '',
					}"
					:community="community"
					@click.native="toggleJoin"
				/>

				<div
					v-if="community.is_member"
					class="-followed"
					:style="{
						'background-color': highlight,
					}"
				>
					<app-jolticon class="-icon" icon="check" :style="{ color: highlightFg }" />
				</div>
			</div>
		</div>

		<div class="-name text-muted">
			{{ community.name }}
		</div>
	</div>
</template>

<style lang="stylus" src="./community-item.styl" scoped></style>
