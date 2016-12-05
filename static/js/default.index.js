var app = function()
{
  var self = {};
  Vue.config.silent = false;
  
  self.extend = function(a, b)
  {
      for (var i = 0; i < b.length; i++) {
        a.push(b[i]);
      }
  };
  
  // ******************************************* Basic utility functions ******************************************** //
  // **************************************************************************************************************** //
  // ************************************************ Generate URLs ************************************************* //
  
  function get_tracks_from_soundcloud_url(start_idx, end_idx)
  {
    var pp = {
      start_idx: start_idx,
      end_idx: end_idx
    };
    
    return get_tracks_from_soundcloud_url + "?" + $.param(pp);
  }
  
  function get_tracks_from_spotify_url(start_idx, end_idx)
  {
    var pp = {
      start_idx: start_idx,
      end_idx: end_idx
    };
    
    return spotify_url + "?" + $.param(pp);
  }
  
  // ************************************************ Generate URLs ************************************************* //
  // **************************************************************************************************************** //
  // ************************************************** Get tracks ************************************************** //
  
  self.get_tracks_from_soundcloud = function()
  {
    $.getJSON(get_tracks_from_soundcloud_url(0, 10), function(data)
    {
      self.vue.soundcloudTracks = data.tracks;
      self.vue.logged_in = data.logged_in;
      self.vue.has_more_from_soundcloud = data.has_more;
    });
  };
  
  self.get_tracks_from_spotify = function()
  {
    $.getJSON(get_tracks_from_spotify_url(0, 10), function (data) {
      self.vue.spotifyTracks = data.spotifyTracks;
      self.vue.logged_in = data.logged_in;
      self.vue.has_more_from_spotify = data.has_more;
    });
  };
  
  // ************************************************** Get tracks ************************************************** //
  // **************************************************************************************************************** //
  // *************************************************** Get more *************************************************** //
  
  self.get_more = function()
  {
    var num_tracks = self.vue.spotifyTracks.length;
    $.getJSON(get_tracks_from_spotify_url(num_tracks, num_tracks + 5), function (data) {
      self.vue.has_more_from_spotify = data.has_more;
      self.extend(self.vue.spotifyTracks, data.spotifyTracks);
    });
  };
  
  // *************************************************** Get more *************************************************** //
  // **************************************************************************************************************** //
  // ************************************************ Add new tracks ************************************************ //
  
  self.add_track_from_soundcloud = function()
  {
    var scSrc = $("#search-field-soundcloud").val();
    if(scSrc == null || scSrc == "")
      return;
    
    $.post(add_track_from_soundcloud_url,
    {
      url: scSrc
    },
    function(data)
    {
      console.log("Inserted Soundcloud track with ID: " + data.track_id);
    });
  };
  
  self.add_track_from_spotify = function()
  {
    // The submit button to add a track has been added.
    $.post(add_track_from_spotify_url,
      {
        song: self.vue.form_song,
      },
      function (data) {
        $.web2py.enableElement($("#spotify-search-button"));
        // for (i = 0; i < data.track.length; i++) {
        //     self.vue.spotifyTracks.unshift(data.track[i]);
        // }
        console.log(data.track.length);
      }
    );
    
    location.reload();
  };
  
  self.upload_local_file = function()
  {
    var selectedFiles = $("#local-song-upload")[0].files;
    if(selectedFiles == null)
      return;
    
    var rejectedFileNames = [];
    
    for(var i = 0; i < selectedFiles.length; ++i) {
      var fileSizeMB = ((selectedFiles[i].size / 1024) / 1024);
      console.log("Selected file: " + selectedFiles[i].name);
      if(fileSizeMB <= 20) {
        console.log("File accepted.");
        $.post(add_track_from_local_url,
        {
          file: selectedFiles[i],
          file_name: selectedFiles[i].name
        },
        function(data)
        {
          console.log("Inserted file with ID: " + data.track_id);
        });
      }
      else {
        console.log("The size of the file is too damn high! Files over 20MB not accepted.");
        rejectedFileNames.push(selectedFiles[i].name);
      }
    }
    
    if(rejectedFileNames.length > 0) {
      alert("Music files over 20MB are not accepted. The following offenders have been disregarded:\n"
          + rejectedFileNames.join("\n")
      );
    }
  };
  
  self.add_track_to_library = function(id)
  {
    $.post(add_track_to_library_url,
      {
        id: id
      },
      function() {
        console.log("Added");
      }
    )
  };
  
  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    
    data: {
      soundcloudTracks: [],
      spotifyTracks: [],
      
      logged_in: false,
      has_more_from_soundcloud: false,
      has_more_from_spotify: false,
      
      form_song: null
    },
    
    methods: {
      add_track_from_soundcloud: self.add_track_from_soundcloud,
      add_track_from_spotify: self.add_track_from_spotify,
      upload_local_file: self.upload_local_file,
      
      add_track_to_library: self.add_track_to_library,
      
      get_more: self.get_more
    }
  });
  
  self.get_tracks_from_spotify();
  $("#vue-div").show();
  return self;
};

var APP = null;
jQuery(function() { APP = app(); });
