<script lang="ts" src="./firesides"></script>

<template>
	<app-communities-view-page-container full>
		<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
			<translate>Active Firesides</translate>
			<small v-if="Screen.isDesktop">in {{ community.name }}</small>
		</h1>
		<br />

		<app-illustration v-if="!community.allow_firesides" :src="illNoComments">
			<p>
				<translate>This community doesn't allow firesides.</translate>
			</p>
		</app-illustration>
		<app-illustration
			v-else-if="isRouteBootstrapped && firesides.length === 0"
			:src="illNoComments"
		>
			<p>
				<translate>There are no active firesides in this community yet.</translate>
			</p>
		</app-illustration>
		<div v-else :style="gridStyling">
			<template v-if="!firesides.length">
				<app-fireside-avatar-base
					v-for="i of placeholderCount"
					:key="`placeholder-${i}`"
					:is-placeholder="true"
				/>
			</template>
			<template v-else>
				<app-fireside-avatar
					v-for="fireside of firesides"
					:key="fireside.id"
					:fireside="fireside"
					hide-community
				/>
			</template>
		</div>
	</app-communities-view-page-container>
</template>
