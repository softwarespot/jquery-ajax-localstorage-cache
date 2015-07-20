JALC
----
jquery-ajax-localstorage-cache - abbreviated to JALC from here on (full name is a mouthful!)

JALC is a plugin built for jQuery (> 1.5.1) and any object implementing the
[storage interface](https://developer.mozilla.org/en-US/docs/Web/API/Storage), such as
[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

It's built on a fork from the [jStorage-dependent original](https://github.com/nectify/jquery-ajax-jstorage-cache).
It provides a client-side cache for AJAX responses intended to save bandwith and time.

# Usage

## Parameters
```javascript
	var jqxhr =  $.ajax({
		url          : '/api/example',
		localCache   : true,        // Either a boolean value, in which case localStorage will be used; otherwise,
		an object that implements the Storage interface [required]

		cacheTTL     : 1,           // Time to live (TTL) in hours [optional]
		cacheKey     : 'post',      // Cache key to access directly [optional]
		isCacheValid : function() {  // Function to verify the cache is valid [optional]
			return true;
		}
	});
	
	jqxhr.done(function(response, textStatus, $this) {
		// The response on 'done'
	});
	
	jqxhr.fail(function ($this, textStatus, errorThrown) {
		// The response on 'fail'
	});
```
With your AJAX request, you get 4 new parameters:

* localCache
	* Turn localCache on/off, or specify an object implementing the Storage interface to use
	* Default: false
* cacheTTL
    * Time to live (TTL) in hours of how long the data is valid for
    * Default: 1 hour
* cacheKey
	* CacheKey is the key that will be used to store the response in localStorage. It allows you to delete your cache easily with the localStorage.removeItem() function
	* Default: URL + TYPE(GET/POST) + DATA
* isCacheValid
	* This function must return true or false. On false, the cached response is removed
	* Default: null

## Notes

* You can delete the entire cache by using ```localStorage.clear()```, or by using ```localStorage.removeItem('cacheKey')```
if you specified a particular cacheKey. Note the above assumes you're using localStorage - replace as appropriate with your
Storage interface implementing object.
* You can pre-load content with this plugin. You just have do to an initial AJAX request with the same
cacheKey.

# License

This project is distributed under Apache 2 License. See LICENSE.txt for more information.
