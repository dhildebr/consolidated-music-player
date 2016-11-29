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
        $.getJSON(get_tracks_url(0, 20), function (data) {
            self.vue.tracks = data.tracks;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };

    self.add_track_from_spotify = function () {
        // The submit button to add a track has been added.
        $.post(add_track_from_spotify_url,
            {
                song: self.vue.form_song,
            },
            function (data) {
                // $.web2py.enableElement($("#add_track_from_spotify_submit"));
                console.log(data.track);
            }
        );
        location.reload();
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
            add_track_from_spotify: self.add_track_from_spotify
        }
    })
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