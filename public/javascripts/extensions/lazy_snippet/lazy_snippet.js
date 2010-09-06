var LazySnippet = Class.create({

	name: null, domId: null, page: null, spinner: null,

	initialize: function(name, options) {
		this.name    = name;
		this.domId   = new LazySnippet.Identifier().generate(this.name);
		this.spinner = new LazySnippet.Spinner(this.domId);

		this.writeReplacement();

		if (options && options.page) {
			this.page = options.page;
		}
	},

	writeReplacement: function() {

    var content = '' +
      '<div id="' + this.domId + '" style="position: relative; height: 100%; width: 100%; min-height: 32px; height: expression(this.scrollHeight < 32? \'32px\' : \'auto\');">' +
        '<div style="position: absolute; top:50%; right: 50%;">' +
             '<span id="' + this.spinner.domId + '" style="display: block; width: 32px; height: 32px; margin: -16px -16px 0 0; background-image: url(/javascripts/extensions/lazy_snippet/images/ajax-loader.gif);">' + '</span>' +
        '</div>' +
      '</div>';

		document.write(content);
	}

});

LazySnippet.Identifier = Class.create({
  generate: function(prefix) {
    return prefix + '_' + ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 18);
  }
});

LazySnippet.Spinner = Class.create({
	domId: null, object: null, containerId: null,

	initialize: function(id) {
		this.containerId = id;
		this.domId       = this.containerId + '_spinner';
	},

	show: function() {
	  this.object.setStyle({display: 'block'});
	},

	hide: function() {
		this.object.hide();
	}

});

LazySnippet.Registry = {

	snippets: [], page: null,

	add: function(name, page, options) {
		options = options || {};
		return this.snippets.push(new LazySnippet(name, Object.extend(options, {'page': page})));
	},

	load: function() {
		this.snippets.each(function(snippet) {
			new Ajax.Request(LazySnippet.Configuration.url, {
		    method     : 'post',
	      parameters : {'snippet': snippet.name, 'url':  snippet.page},
        onSuccess  : this.onSuccess.bind(snippet)
	    });
	  }.bind(this));
	},

	onSuccess: function(response) {
    $(this.domId).replace(response.responseText);
	},

	run: function() {		
		Event.observe(window, 'load', LazySnippet.Registry.load.bind(this));
	}
};

LazySnippet.Configuration = {
  url: '/snippet'
};

LazySnippet.Registry.run();