/**
* This script serves as utility helper to use throughout the TurnTo logic
*
* To use specify the global variable TurnToHelper then a dot then the function name (e.g. TurnToHelper().getLocalizedTurnToPreferenceValue() )
*
*/

/* API Includes */
var Site = require('dw/system/Site');
var System = require('dw/system/System');

var TurnToHelper = {
		
	/**
	 * @function
	 * @name getLocalizedTurnToPreferenceValue
	 * @param preferenceName The name of the localized TurnTo SitePreference to retrieve
	 * @param locale The locale in which to retrieve a value. If not matching locale is returned, the default is used
	 * @return {String} The localized value of the Site Preference specified by the preferenceName parameter
	 */
	getLocalizedTurnToPreferenceValue: function( preferenceName, locale ) {
		var localizedValues : dw.util.Collection = Site.getCurrent().getCustomPreferenceValue( preferenceName );
		var preferenceValue : String = null;
		for each( var entry : String in localizedValues ) {
			var entryLocale : String = entry.split( ":" )[0];
			var entryValue : String = entry.split( ":" )[1];
			if( entryLocale == locale ) {
				preferenceValue = entryValue;
				break;
			} else if( entryLocale == 'default' && preferenceValue == null ) {
				preferenceValue = entryValue;
			}
		}
		return preferenceValue;
	},
	
	/**
	 * @function
	 * @name getLocalizedSitePreferenceFromRequestLocale
	 * @param preferenceName The name of the localized TurnTo SitePreference to retrieve
	 * @return {String} The localized value of the Site Preference specified by the preferenceName parameter
	 */
	getLocalizedSitePreferenceFromRequestLocale: function( preferenceName ) {
		return TurnToHelper.getLocalizedTurnToPreferenceValue(preferenceName, request.httpLocale);
	},
	
	/**
	 * @function
	 * @name getURLSitePreference
	 * @return {String} the URL site preference
	 */
	getURLSitePreference: function() {
		return Site.getCurrent().getCustomPreferenceValue('turntoURL');
	},
	
	/**
	 * @function
	 * @name hasSiteAndAuthKeyPerLocale
	 * @param locale The locale in which to check if a site and auth key exists
	 * @return {Boolean} true if the locale contains both auth and site keys; false if it does not contain an auth key, site key or both
	 */
	hasSiteAndAuthKeyPerLocale: function( locale ) {
		var localizedSiteKeyValues : dw.util.Collection = Site.getCurrent().getCustomPreferenceValue('turntoSiteKey');
		var localizedAuthKeyValues : dw.util.Collection = Site.getCurrent().getCustomPreferenceValue('turntoAuthKey');
	
		var hasSiteKey,hasAuthKey;
		hasSiteKey = hasAuthKey = false;
		
		for each( var siteKey : String in localizedSiteKeyValues ) {
			var entryLocale : String = siteKey.split( ":" )[0];
			var entryValue : String = siteKey.split( ":" )[1];
			if( entryLocale == locale ) {
				hasSiteKey = true;
				break;
			}
		}
		
		for each( var authKey : String in localizedAuthKeyValues ) {
			var entryLocale : String = authKey.split( ":" )[0];
			var entryValue : String = authKey.split( ":" )[1];
			if( entryLocale == locale ) {
				hasAuthKey = true;
				break;
			}
		}
		
		return hasSiteKey && hasAuthKey;
	},
	
	/**
	 * @function
	 * @name getAllowedLocales
	 * @description retrieve the allowed lcoales per site
	 * @description retrieve the allowed locales per site that contain both a site and auth key
	 * @returns {List} allowed locales
	 */
	getAllowedLocales: function() {
		//loop through site enabled locales to generate a catalog export for each locale		
		var siteAllowedLocales = Site.getCurrent().getAllowedLocales();
		var adjustedAllowedLocales = [];
		
		for each(var locale in siteAllowedLocales) {
			//If turntoAuthKey and turntoSiteKey values are not defined for a particular locale the job should skip the locale.
			if(TurnToHelper.hasSiteAndAuthKeyPerLocale(locale)) {
				adjustedAllowedLocales.push(locale);
			}
		}
		
		return adjustedAllowedLocales;
	},

	/**
	 * @function
	 * @name replaceNull
	 * @description Replaces null with the specified replacement string.
	 * @param {String} The string to replace if null
	 * @param {String} The string to use as a replacement
	 * @returns {String} - replace if str is null, otherwise str
	 */
	replaceNull: function(str, replace) {
		return (!empty(str)) ? str : replace;	
	},

	/**
	 * @function
	 * @name getPageID
	 * @description Retrieve Page ID from current URL
	 * @returns {string} page ID
	 */
	getPageID: function () {
		var pageID,
			currentPage = request.httpPath;

		//NOTE: these can be modified if you need more or less defined page IDs
		//if you do modify the following switch cases then make sure you adjust the conditional statements in 'htmlheadincludejs.isml'
		//also new page IDs will need to be added to the TurnTo system in order for features to work, reach out to your TurnTo representative
		if (currentPage.indexOf('Product') > -1) {
			pageID = 'pdp-page';
		} else if (currentPage.indexOf('Confirm') > -1) {
			pageID = 'order-confirmation-page';
		} else if (currentPage.indexOf('Search') > -1) {
			pageID = 'search-page';
		} else if (new RegExp('^.*Cart|Checkout|Shipping|Billing|Summary').test(currentPage)) {
			pageID = 'checkout-page';
		} else {
			pageID = 'non-defined-page';
		}
		
		return pageID
	}

}

module.exports = TurnToHelper;
