<template>
	<app-pill v-if="!channel" :to="toCommunity">
		<app-community-thumbnail-img slot="img" :community="community" />

		{{ community.name }}
		<app-community-verified-tick class="-tick" :community="community" small />
	</app-pill>
	<app-pill-bi v-else :left-to="toCommunity" :right-to="toChannel">
		<app-community-thumbnail-img slot="img" :community="community" />

		<template slot="left">
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />
		</template>

		<template slot="right">
			{{ channel.title }}

			<app-jolticon
				v-if="communityLink.isFeatured"
				class="-featured"
				icon="star"
				v-app-tooltip="$gettext(`Featured`)"
			/>
		</template>
	</app-pill-bi>
</template>

<style lang="stylus" scoped>
.-tick
	margin-left: 5px

.-featured
	margin: 0 0 3px 5px
	font-size: 12px
</style>

<script lang="ts" src="./pill"></script>
