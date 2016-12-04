# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

def get_user_email():
    return auth.user.email if auth.user else None

db.define_table('soundcloud_urls',
                Field('url', 'text')
                )

db.define_table('track',
                Field('artist'),
                Field('album'),
                Field('title'),
                Field('duration', 'float'),
                Field('track_source',default='manual'),
                Field('track_uri')
                )

db.define_table('local_tracks',
                Field('track', 'upload'),
                Field('track_file_name')
                )

db.define_table('library',
                Field('artist'),
                Field('album'),
                Field('title'),
                Field('duration', 'float'),
                Field('track_source', default='manual'),
                Field('track_uri')
                )

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)