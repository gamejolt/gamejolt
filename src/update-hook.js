module.exports.pre = function(version, packagePath) {
	return Promise.resolve(true);
};

module.exports.post = function(version, packagePath) {
	return Promise.resolve();
};
