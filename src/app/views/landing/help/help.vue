<template>
	<div>
		<section class="section landing-header">
			<div class="container">
				<div class="row">
					<div class="col-lg-offset-1 col-lg-11">
						<h1>
							<app-theme-svg
								src="~img/jolt.svg"
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
					<div class="col-lg-1"></div>
					<div class="col-sm-9 col-lg-7">
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./help"></script>

<style lang="stylus" scoped>
// Get rid of the top margin that headings produce from the compiled markdown.
.-content >>>
	& h1:first-child
		margin-top: 0
</style>
