<script lang="ts" src="./help"></script>

<template>
	<div>
		<section class="section landing-header">
			<div class="container">
				<div class="row">
					<div class="col-lg-offset-1 col-lg-11">
						<h1>
							<app-theme-svg
								:src="imageJolt"
								alt=""
								:width="17 * 3"
								:height="18 * 3"
								strict-colors
							/>
							<translate>Help Docs</translate>
						</h1>
					</div>
				</div>
			</div>
		</section>

		<section class="section -content">
			<div class="container">
				<div class="row">
					<div class="col-lg-1" />
					<div class="col-sm-9 col-lg-7">
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-content
	// Get rid of the top margin that headings produce from the compiled markdown.
	::v-deep(h1:first-child)
		margin-top: 0
</style>
