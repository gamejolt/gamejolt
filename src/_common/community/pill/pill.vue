<template>
	<app-pill v-if="!channel" :to="toCommunity">
		<app-community-thumbnail-img slot="img" :community="community" />

		{{ community.name }}
	</app-pill>
	<span class="-pill-bi" v-else>
		<router-link class="-left" :to="toCommunity">
			<span class="-content">
				<span class="-img">
					<app-community-thumbnail-img :community="community" />
				</span>
				{{ community.name }}
			</span>

			<span class="-sep">
				<span class="-container">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						<polygon points="0,0 100,0 0,100" />
					</svg>
				</span>
			</span>
		</router-link>

		<router-link class="-right" :to="toChannel">
			{{ channel.title }}
		</router-link>
	</span>
</template>

<style lang="stylus" src="./pill.styl" scoped></style>

<script lang="ts" src="./pill"></script>
