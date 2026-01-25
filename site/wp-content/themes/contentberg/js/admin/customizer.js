/**
 * Extending customizer module.
 */
(function($, api, _) {
	"use strict";
	
	const optionsKey    = Bunyad_CZ_Data.settingPrefix;
	const controlPrefix = Bunyad_CZ_Data.controlPrefix;
	
	/**
	 * Mailchimp parse
	 */
	$(document).on('input change', '#customize-control-bunyad_home_subscribe_url input', function() {
		
		var code = $(this).val(),
		    match = code.match(/action=\"([^\"]+)\"/);
		
		if (match) {
			$(this).val(match[1]);
		}
	});

})(jQuery, wp.customize, _);