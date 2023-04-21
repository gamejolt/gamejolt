export type VolumeMonitor = ReturnType<typeof createVolumeMonitor>;

export function createVolumeMonitor(stream: MediaStream) {
	const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
	const source = audioContext.createMediaStreamSource(stream);

	const analyzer = audioContext.createAnalyser();
	analyzer.fftSize = 32;

	source.connect(analyzer);

	const buffer = new Uint8Array(analyzer.fftSize);

	function getVolume() {
		analyzer.getByteTimeDomainData(buffer);

		const range = _getDynamicRange(buffer) * (Math.E - 1);
		return Math.log1p(range);
	}

	function _getDynamicRange(buffer: Uint8Array) {
		const len = buffer.length;
		let min = 128;
		let max = 128;

		for (let i = 0; i < len; i++) {
			const sample = buffer[i];
			if (sample < min) {
				min = sample;
			} else if (sample > max) {
				max = sample;
			}
		}

		return (max - min) / 255;
	}

	async function close() {
		source.disconnect();
		await audioContext.close();
	}

	return {
		getVolume,
		close,
	};
}
