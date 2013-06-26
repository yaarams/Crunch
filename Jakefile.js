// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

/*global desc, task, jake, fail, complete */
(function () {
	"use strict";

	desc("Build and test");
	task("default", ["test"]);

	desc("Test everything");
	task("test", [], function () {
		var testFiles = new jake.FileList();
		testFiles.include("**/_*_test.js");
		testFiles.exclude("node_modules");

		var reporter = require("nodeunit").reporters["default"];
		reporter.run(testFiles.toArray(), null, function (failures) {
			if (failures) fail("Tests failed");
			complete();
		});
	}, {async:true});



	function nodeLintOptions() {
		return {
			bitwise:true,
			curly:false,
			eqeqeq:true,
			forin:true,
			immed:true,
			latedef:true,
			newcap:true,
			noarg:true,
			noempty:true,
			nonew:true,
			regexp:true,
			undef:true,
			strict:true,
			trailing:true,
			node:true
		};
	}
}());