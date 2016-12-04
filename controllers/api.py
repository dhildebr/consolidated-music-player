import requests

# Searching for tracks
def get_tracks():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    # We just generate a lot of of data.
    tracks = []
    has_more = False
    rows = db().select(db.track.ALL, limitby=(start_idx, end_idx + 1))
    # rows.update_record()
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id=r.id,
                artist=r.artist,
                album=r.album,
                title=r.title,
                duration=r.duration,
                track_source = r.track_source,
                track_uri = r.track_uri,
                user_email = r.user_email
            )

            if r.track_source == 'spotify':
                t['audio_file'] = "https://embed.spotify.com/?uri={}&theme=white".format(r.track_uri)
            else:
                t['audio_file'] = "#"
            tracks.append(t)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    return response.json(dict(
        tracks=tracks,
        logged_in=logged_in,
        has_more=has_more,
    ))

def _get_track_id_from_spotify(input):
    list=[]
    url = "https://api.spotify.com/v1/search"
    if (request.vars.dropdown=='tracks'):
        params = dict(q="track:"+input, type='track', limit=50)
    else:
        params = dict(q=input, type='artist', limit=1)
    results = requests.get(url=url, params=params)
    result_json = results.json()
    # print result_json
    if result_json.has_key('tracks'):
        items = result_json['tracks']['items']
    elif result_json.has_key('artists'):
        items= result_json['artists']['items']
    else:
        return None

    for i in range(0,len(items)):
        if len(items):
            list.append(items[i]['id'])
        else:
            return None

    return list

def _get_ids_from_spotify_for_track(track):
    id_list = _get_track_id_from_spotify(input=track)
    if id_list is None:
        response.flash = T("Track '{}' not found".format(track))
        return []
    if len(id_list)>1:
        url = "https://api.spotify.com/v1/tracks/?ids="
        for i in range(0, len(id_list)):
            url += id_list[i] + ","
        url = url[:-1]
        results = requests.get(url=url)
    else:
        url = "https://api.spotify.com/v1/artists/{}/top-tracks".format(id_list[0])
        country = 'US'
        params = {}
        params['country'] = country
        results = requests.get(url=url, params=params)
        # album_url = "https://api.spotify.com/v1/artists/{}/albums".format(id_list[0])
        # album_result = requests.get(url=album_url)
        # album_result = album_result.json()
        # items = album_result['items']
        # songs = []
        # for i in range(0,len(items)):
        #     track_url= "https://api.spotify.com/v1/albums/{}/ tracks".format(i['id'])
        #     track_result= requests.get(url=track_url)
        #     track_result_json = track_result.json()
        #     songs.append(track_result_json['items'])
        # tracks_list = songs[0]
        # for i in range(0,len(tracks_list)):



    results_for_db = _parse_spotify_tracks(results.json())
    return results_for_db


def _parse_spotify_tracks(results):
    tracks = results['tracks']
    ret_tracks = []
    # logger.info("Found %d tracks" % len(tracks))
    for track in tracks:
        t = {}
        t['album'] = track['album']['name']
        t['artist'] = track['artists'][0]['name']
        t['title'] = track['name']
        t['duration'] = float(track['duration_ms']) / 1000.0
        t['track_source'] = 'spotify'
        t['track_uri'] = track['uri']
        # logger.info("inserting track %r" % t)
        # db.track.insert(**t)

        t['audio_file'] = "https://embed.spotify.com/?uri={}&theme=white".format(t['track_uri'])
        ret_tracks.append(t)
    return ret_tracks


def add_track_from_spotify():
    del_songs()
    # if (request.vars.dropdown=='tracks'):
    tracks = _get_ids_from_spotify_for_track(request.vars.input)
    tracks_info = []
    for i in range(0,len(tracks)):
        t_id = db.track.insert(
            id = request.vars.id,
            album = tracks[i]['album'],
            artist = tracks[i]['artist'],
            title = tracks[i]['title'],
            duration = tracks[i]['duration'],
            track_source = tracks[i]['track_source'],
            track_uri = tracks[i]['track_uri'],
        )
        tracks_info.append(t_id)
    return response.json(dict(track=tracks_info))

def del_songs():
    db.track.truncate()
    return "ok"

# --------------------------------

# Add selected track to database

def add_track_to_library():
    library = []
    track = db(db.track.id==request.vars.id).select()
    for t in track:
        artist = t.artist
        album = t.album
        title = t.title
        duration = t.duration
        track_source = t.track_source
        track_uri = t.track_uri
    t_id = db.library.insert(
        artist = artist,
        album = album,
        title = title,
        duration = duration,
        track_source = track_source,
        track_uri = track_uri,
        user_email = auth.user.email
    )
    library.append(t_id)
    response.flash = T(title + " added to library")
    return response.json(dict(library=library))

def get_library():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    # We just generate a lot of of data.
    tracks = []
    has_more = False
    rows = db().select(db.library.ALL, limitby=(start_idx, end_idx + 1))
    # rows.update_record()
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                artist=r.artist,
                album=r.album,
                title=r.title,
                duration=r.duration,
                track_source = r.track_source,
                track_uri = r.track_uri
            )

            if r.track_source == 'spotify':
                t['audio_file'] = "https://embed.spotify.com/?uri={}&theme=white".format(r.track_uri)
            else:
                t['audio_file'] = "#"
            tracks.append(t)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    return response.json(dict(
        library=tracks,
        logged_in=logged_in,
        has_more=has_more,
    ))

def del_from_library():
    db(db.library.id == request.vars.track_id).delete()
    return "ok"