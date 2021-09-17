<script lang="ts" src="./add"></script>

<template>
	<app-fireside-avatar-base>
		<template #avatar>
			<app-jolticon icon="add" />
		</template>

		<template #tag>
			<translate>CREATE</translate>
		</template>

		<template #title>
			<translate>New fireside</translate>
		</template>

		<template #link>
			<a @click="onClick" />
		</template>
	</app-fireside-avatar-base>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.jolticon
	font-size: $jolticon-size * 2
</style>
