<template>
	<div>
		<section class="section landing-header">
			<div class="container">
				<div class="row">
					<div class="col-lg-offset-1 col-lg-11">
						<h1>
							<app-theme-svg src="~img/jolt.svg" alt="" :width="17 * 3" :height="18 * 3" />
							<translate>Help Docs</translate>
						</h1>
					</div>
				</div>
			</div>
		</section>

		<section class="section">
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
