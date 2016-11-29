var Track = function(trackSource, name)
{
  this.trackSource = trackSource;
  this.name = name;
};

var app = function()
{
  var self = {};
  Vue.config.silent = false;
  
  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    
    data: {
      tracks: []
    },
    
    methods: {
      
    }
  });
};

var APP = null;
jQuery(function() { APP = app(); });
