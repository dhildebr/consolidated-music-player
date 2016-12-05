var app = function() {

    var self = {};

    Vue.config.silent = false;  //show all warnings
    //
    //
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
        return library_url + "?" + $.param(pp);
    }

    self.get_library = function () {
        $.getJSON(get_tracks_url(0, 100), function (data) {
            self.vue.library = data.library;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.user_email = current_user;
        })
    };

    self.get_more = function () {
        var num_tracks = self.vue.library.length;
        $.getJSON(get_tracks_url(num_tracks, num_tracks + 5), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.tracks, data.library);
        });
    };

    self.delete_track = function (track_id) {
        $.post(del_track_url,
            {
                track_id: track_id
            },
            function () {
                var idx = null;
                console.log(track_id);
                for (var i = 0; i < self.vue.library.length; i++) {
                    if (self.vue.library[i].id === track_id) {
                        // If I set this to i, it won't work, as the if below will
                        // return false for items in first position.
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                    self.vue.library.splice(idx - 1, 1);
                }
            }
        )
    };

    // self.add_track_from_spotify = function () {
    //     // The submit button to add a track has been added.
    //     $.post(add_track_from_spotify_url,
    //         {
    //             song: self.vue.form_song,
    //         },
    //         function (data) {
    //             $.web2py.enableElement($("#add_track_from_spotify_submit"));
    //             // for (i = 0; i < data.track.length; i++) {
    //             //     self.vue.tracks.unshift(data.track[i]);
    //             // }
    //             console.log(data.track.length);
    //         }
    //     );
    //     location.reload();
    // };
    //
    // self.add_track_to_library = function (id) {
    //   $.post(add_track_to_library_url,
    //       {
    //           id: id
    //       },
    //       function(){
    //         console.log(id);
    //       }
    //   )
    // };
    //
    //
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            library: [],
            logged_in: false,
            has_more: false,
            user_email: null
        },
        methods: {
            delete_track: self.delete_track
        }
    });
    self.get_library();;
    $("#vue-div").show();
    return self;

}

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});