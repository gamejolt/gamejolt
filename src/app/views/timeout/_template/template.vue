<script lang="ts" src="./template"></script>

<template>
	<div>
		<template v-if="timeout.reason_template === 'violated-guidelines'">
			<translate>(General violation of site guidelines)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'violated-terms'">
			<translate>(Violated terms and conditions)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'harassment'">
			<translate>(Harassed other user(s) with comments/posts/games/communities)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'hateful-speech'">
			<translate>(Hateful speech used in comments/posts/games/communities)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'private-info'">
			<translate>(Private info leaked using comments/posts/games/communities)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'spam'">
			<translate>(Spammed other users using comments/posts/games)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'stolen-game'">
			<translate>(Game or its assets are stolen)</translate>
		</template>
		<template v-else-if="timeout.reason_template === 'explicit'">
			<translate>(Posted explicit content in disallowed places)</translate>
		</template>
		<div>STOP RIGHT THERE CRIMINAL SCUM, YOU HAVE VIOLATED THE LAW!</div>
	</div>
</template>

<style lang="stylus" scoped></style>
