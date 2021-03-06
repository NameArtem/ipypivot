
'use script';

var $ = require('jquery');
require('jquery-ui-bundle');
require('pivottable');
require('pivottable/dist/export_renderers.min.js');
require('pivottable/dist/c3_renderers.min.js');
require('pivottable/dist/d3_renderers.min.js');

require('./pivot-table.css');
require('./style.css');
require('./c3.css');

var util = require('./util');


var createPivot = function (that) {
	console.log('ipypivot start createPivot');

	// create elmt
	var divElmt = document.createElement('div');
	divElmt.setAttribute('width', '100%');

	// append elmt to dom
	that.el.appendChild(divElmt);

	// set class
	that.el.setAttribute('class', 'jupyter-widget pivot-table');

	// attach to view
	that.tableElmt = divElmt;

	// set mode='pivot' to indicate origin
	this.call_pivottablejs(that, 'pivot', 'create');

	console.log('end createPivot');
};

var createPivotUI = function (that) {
	console.log('ipypivot start createPivotUI');

	// create elmt
	var divElmt = document.createElement('div');
	divElmt.setAttribute('width', '100%');

	// append elmt to dom
	that.el.appendChild(divElmt);

	// set class
	that.el.setAttribute('class', 'jupyter-widget pivotui-table');

	// attach to view
	that.tableElmt = divElmt;

	// set mode='pivotui' to indicate origin
	this.call_pivottablejs(that, 'pivotui', 'create');

	// add delay - else random failures - unknown race condition...
	var here = this;
	setTimeout(function () {
		here.save_to_model(that);
	}, 10);

	console.log('end createPivotUI');
};


var call_pivottablejs = function (that, mode) {
	// mode = 'pivot' - call from createPivot
	// mode = 'pivotui' - call from createPivotUI

	console.log('ipypivot PivotUIModel start call_pivottablejs');

	// get data from model
	let data = that.model.get('_data');

	// get options
	let options = that.model.get('_options');
	options = util.JSONPivotTable.parse(JSON.stringify(options));

	// copy dic
	let options_new = $.extend({}, options);

	// if no renderer present add them
	if (!options_new['renderers']) {
		console.log('add renderers');
		var renderers = $.extend({},
			$.pivotUtilities.renderers,
			$.pivotUtilities.c3_renderers,
			$.pivotUtilities.d3_renderers
		);
		// renderers = $.extend(renderers, $.pivotUtilities.export_renderers);
		options_new['renderers'] = renderers;
	}
	// console.log(options_new);

	// actual pivottable.js call
	if (mode == 'pivot') {
		console.log('call pivot');
		$(that.tableElmt).pivot(data, options_new);
	}
	if (mode == 'pivotui') {
		console.log('call pivotui');
		$(that.tableElmt).pivotUI(data, options_new, true);
	}

	console.log('end call_pivottablejs');

	// debug
	window.that = that;
	window.$ = $;
	window.data = data;

};

var save_to_model = function (that) {

	console.log('ipypivot start save_to_model');

	// get data from model
	let data = that.model.get('_data');

	// deepcopy current pivotUI options
	let optionsExport = $.extend({}, $(that.tableElmt).data('pivotUIOptions'));
	// console.log(optionsExport);

	// add only TSV export renderer
	optionsExport['renderers'] = $.pivotUtilities.export_renderers;
	optionsExport['rendererName'] = 'TSV Export';

	// create new elemt - which is never added to the dom
	var tempDivElmt = document.createElement('div');

	// actual pivottable.js call - as a promise to trigger post processing
	var createTsvTable = Promise.resolve($(tempDivElmt).pivotUI(data, optionsExport).promise());

	// action promise
	createTsvTable.then(function () {
		// post processing
		console.log('start save_to_model callback');

		// DESPITE PROMISE (!) add delay - else random failures - unknown race condition...
		setTimeout(function () {

			// extract tsv string
			// let data_tsv = tempDivElmt.children[0].children[2].children[1].children[0].innerHTML;
			let data_tsv = $(tempDivElmt).find('.pvtRendererArea')[0].children[0].innerHTML;

			// console.log('data_tsv');
			// console.log(data_tsv);

			// actual pivottable.js call to collect current options
			let options = $(that.tableElmt).data('pivotUIOptions');
			// console.log(options);

			// merge current options with old options in order to replace true functions by their strings
			delete options['aggregators'];
			delete options['renderers'];
			delete options['sorters'];
			delete options['derivedAttributes'];
			delete options['rendererOptions'];

			let old_options = that.model.get('_options');
			options = $.extend({}, old_options, options);
			// console.log(options);

			console.log('update model');
			that.model.set({
				'_data_tsv': data_tsv,
				'_options': options
			});

			// that.model.save_changes();
			that.touch();

			console.log('end save_to_model callback');

			// debug
			window.data_tsv = data_tsv;

		}, 100);

	});

	console.log('end save_to_model');

	// debug
	window.tempDivElmt = tempDivElmt;
	window.createTsvTable = createTsvTable;

};


var pivot_table = {
	createPivot: createPivot,
	createPivotUI: createPivotUI,
	call_pivottablejs: call_pivottablejs,
	save_to_model: save_to_model,
};

module.exports = pivot_table;

