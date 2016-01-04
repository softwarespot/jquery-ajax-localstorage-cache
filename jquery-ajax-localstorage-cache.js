/**
 * https://github.com/SaneMethod/jquery-ajax-localstorage-cache
 */
; // jshint ignore:line
(function jQueryAjaxLocalStorageCacheNamespace(window, $, undefined) {
    // Constants

    /**
     * The request has succeeded
     *
     * @type {number}
     */
    var HTTP_STATUS_OK = 200;

    /**
     * Prefilter for caching ajax calls
     * See also $.ajaxTransport for the elements that make this compatible with jQuery Deferred.
     * New parameters available on the ajax call:
     * localCache   : true // required - either a boolean (in which case localStorage is used), or an object
     *                implementing the Storage interface, in which case that object is used instead.
     * cacheTTL     : 5,        // optional - Cache time in minutes, default is 60 (1 hour)
     * cacheKey     : 'post',   // optional - Key under which cached string will be stored
     * isCacheValid : function  // optional - Function that should return either true (valid) or false (invalid)
     * cacheTTLAppend : '_cachettl' // optional - Append to the cacheTTL key
     *
     * @method $.ajaxPrefilter
     * @param options {object} Options for the ajax call, modified with ajax standard settings
     */
    $.ajaxPrefilter(function ajaxPrefilter(options) {
        // If not defined (even though it should be) consider that the user has included the function on each page
        // for convenience
        if (options.localCache === undefined) {
            return;
        }

        var storage = options.localCache === true ? window.localStorage : options.localCache;

        // Check if the storage is valid
        if (!_isStorage(storage)) {
            return;
        }

        // Function to check if the storage data is valid
        var isCacheValid = options.isCacheValid;

        // Get the cache key based on the ajax options
        var cacheKey = _getCacheKey(options);

        if ($.isFunction(isCacheValid) && !isCacheValid()) {
            storage.removeItem(cacheKey);
        }

        // Constant for the cache post-fix, if a string and the length is greater than zero
        var CACHE_TTL_PREFIX = $.type(options.cacheTTLAppend) === 'string' && options.cacheTTLAppend.length > 0 ? options.cacheTTLAppend : '_cachettl';

        // Parse the cache 'Time To Live' as an number from storage. In ES2015 this is now Number.parseInt()
        var ttl = window.parseInt(storage.getItem(cacheKey + CACHE_TTL_PREFIX));

        // Check if ttl is a valid integer
        // In ES2015 this is now Number.isNaN()
        if ($.type(ttl) === 'number' && window.isNaN(ttl)) {
            ttl = 0;
        }

        if (ttl && ttl < +new window.Date()) { // Or instead use new Date().valueOf()
            storage.removeItem(cacheKey);
            storage.removeItem(cacheKey + CACHE_TTL_PREFIX);
            ttl = 0;
        }

        if (!storage.getItem(cacheKey)) {
            // If it not in the cache, store the data, add success callback - normal callback will proceed
            if (options.success) {
                options.realsuccess = options.success;
            }

            options.success = function success(data) {
                var response = data;
                if (this.dataType.toUpperCase().indexOf('JSON') === 0) {
                    response = window.JSON.stringify(data);
                }

                // Save the data to storage catching exceptions (possibly QUOTA_EXCEEDED_ERR)
                try {
                    storage.setItem(cacheKey, response);
                } catch (e) {
                    // Remove any incomplete data that may have been saved before the exception was caught
                    storage.removeItem(cacheKey);
                    storage.removeItem(cacheKey + CACHE_TTL_PREFIX);
                }

                if (options.realsuccess) {
                    options.realsuccess(data);
                }
            };

            // Store timestamp
            if (ttl === 0) {
                // 60000 is the same as 1000 * 60, which is basically equal to one minute
                storage.setItem(cacheKey + CACHE_TTL_PREFIX, +new window.Date() + 60000 * ($.type(options.cacheTTL) === 'number' && options.cacheTTL > 0 ? options.cacheTTL : 60));
            }
        }
    });

    /**
     * This function performs the fetch from cache portion of the functionality needed to cache ajax
     * calls and still fulfil the jqXHR Deferred Promise interface
     * See also $.ajaxPrefilter
     *
     * @method $.ajaxTransport
     * @params options {object} Options for the ajax call, modified with ajax standard settings
     */
    $.ajaxTransport('+*', function ajaxTransport(options) {
        if (options.localCache !== undefined && options.localCache) {
            var storage = (options.localCache === true) ? window.localStorage : options.localCache;

            // Check if the storage is valid
            if (!_isStorage(storage)) {
                return;
            }

            // Get the cache key based on the ajax options
            var cacheKey = _getCacheKey(options);

            // Get the value from storage
            var value = storage.getItem(cacheKey);

            if (value) {
                // In the cache? Get it, parse it to json if the dataType is json,
                // and call the completeCallback with the fetched value.
                if (options.dataType.toUpperCase().indexOf('JSON') === 0) {
                    value = window.JSON.parse(value);
                }

                return {
                    send: function send(headers, completeCallback) {
                        var response = {};
                        response[options.dataType] = value;
                        completeCallback(HTTP_STATUS_OK, 'success', response, '');
                    },

                    abort: function abort() {},
                };
            }
        }

    });

    // Generate the cache key under which to store the local data - either the cache key supplied,
    // or one generated from the url, the type and, if present, the data
    function _getCacheKey(options) {
        // If a string and not whitespace, then use the cacheKey
        if ($.type(options.cacheKey) === 'string' && $.trim(options.cacheKey).length > 0) {
            return options.cacheKey;
        }

        var url = options.url.replace(/(?:jQuery.*)/i, '');

        // Strip _={timestamp}, if cache is set to false
        if (options.cache === false) {
            // RegExp found in jQuery/ajax.js
            url = url.replace(/([?&])_=[^&]*/, '');
        }

        return url + '_' + options.type + (options.data || '');
    }

    // Is a valid storage object that can be used
    function _isStorage(storage) {
        // The functions that are required for this plugin only
        return $.type(storage) === 'object' &&
            'getItem' in storage &&
            'removeItem' in storage &&
            'setItem' in storage;
    }

})(window, window.jQuery);
