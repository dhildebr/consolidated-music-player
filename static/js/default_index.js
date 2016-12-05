
var app = function() {

    var self = {};

    Vue.config.silent = false;  //show all warnings


    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_tracks_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return tracks_url + "?" + $.param(pp);
    }

    self.get_tracks = function () {
        $.getJSON(get_tracks_url(0, 10), function (data) {
            self.vue.tracks = data.tracks;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.user_email = current_user;
        })
    };


    self.get_more = function () {
        var num_tracks = self.vue.tracks.length;
        $.getJSON(get_tracks_url(num_tracks, num_tracks + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.tracks, data.tracks);
        });
    };

    function get_widgets_url(start_idx, end_idx) {
        var pp = {
          start_idx: start_idx,
          end_idx: end_idx
    };
        return widget_url + "?" + $.param(pp);
  }

    self.get_widgets = function() {
    $.getJSON(get_widgets_url(0, 10), function(data) {
              self.vue.widgets = data.widgets;
              self.vue.logged_in = data.logged_in;
              self.vue.has_more_from_soundcloud = data.has_more;
    });
  };

    self._get_track_id_from_spotify = function(){
        $.post(_get_track_id_from_spotify,
            {
                dropdown: self.vue.dropdown
            }
        );

    }

    self._get_ids_from_spotify_for_track = function(){
        $.post(_get_ids_spotify_for_track,
            {
                dropdown: self.vue.dropdown
            }
        );

    }

    self.add_track_from_spotify = function () {
        // The submit button to add a track has been added.
        $.post(add_track_from_spotify_url,
            {
                input: self.vue.form_input,
                dropdown: self.vue.dropdown
            },
            function () {
                $.web2py.enableElement($("#add_track_from_spotify_submit"));
                // for (i = 0; i < data.track.length; i++) {
                //     self.vue.tracks.unshift(data.track[i]);
                // }
                console.log(self.vue.dropdown);
            }
        );
        location.reload();
    };

    self.add_track_from_soundcloud = function(){
        $.post(add_track_from_soundcloud_url,
            {
                url: self.vue.form_widget
            },
            function(){
                console.log(self.vue.widgets);
                // for (var i=0; i<self.vue.widgets.length; i++){
                //     $("#sc").append(self.vue.widgets[i].url);
                // }
            });
    }

    self.add_track_to_library = function (id) {
      $.post(add_track_to_library_url,
          {
              id: id
          },
          function(){
              console.log("Added");
          }
      )
    };

    self.dropdown_select = function(){
        self.vue.dropdown = document.getElementById("dropdown").value;
    }


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            tracks: [],
            widgets:[],
            logged_in: false,
            has_more: false,
            form_input: null,
            form_widget: null,
            dropdown: document.getElementById("dropdown").value,
            user_email: null
        },
        methods: {
            add_track_from_spotify: self.add_track_from_spotify,
            add_track_from_soundcloud: self.add_track_from_soundcloud,
            get_more: self.get_more,
            add_track_to_library: self.add_track_to_library,
            dropdown_select: self.dropdown_select
        }
    });
    self.get_tracks();
    self.get_widgets();
    $("#vue-div").show();
    return self;

}

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});