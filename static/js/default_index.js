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
        })
    };

    self.get_more = function () {
        var num_tracks = self.vue.tracks.length;
        $.getJSON(get_tracks_url(num_tracks, num_tracks + 5), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.tracks, data.tracks);
        });
    };

    self.add_track_from_spotify = function () {
        // The submit button to add a track has been added.
        $.post(add_track_from_spotify_url,
            {
                song: self.vue.form_song,
            },
            function (data) {
                $.web2py.enableElement($("#add_track_from_spotify_submit"));
                // for (i = 0; i < data.track.length; i++) {
                //     self.vue.tracks.unshift(data.track[i]);
                // }
                console.log(data.track.length);
            }
        );
        location.reload();
    };

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


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            tracks: [],
            logged_in: false,
            has_more: false,
            form_song: null,
        },
        methods: {
            add_track_from_spotify: self.add_track_from_spotify,
            get_more: self.get_more,
            add_track_to_library: self.add_track_to_library
        }
    });
    self.get_tracks();
    $("#vue-div").show();
    return self;

}

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});