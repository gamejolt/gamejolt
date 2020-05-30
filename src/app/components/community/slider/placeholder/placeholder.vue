<template>
	<div class="-list">
		<app-scroll-scroller class="-scroller" thin horizontal>
			<div class="-flex">
				<template v-for="n in num">
					<div class="-container" :key="n">
						<div class="-item" />
						<div class="-text" />
					</div>
				</template>

				<div v-if="withAddButton" class="-container">
					<div class="-item" />
				</div>
				<div class="-container">
					<div class="-item -last" />
				</div>
			</div>
		</app-scroll-scroller>
	</div>
</template>

<script lang="ts" src="./placeholder"></script>

<style lang="stylus" src="./placeholder.styl" scoped></style>
