Walla API Documentation
==============

**Title** : Get the domains supported by Walla
**Sample URL** : /api/domains?token=123456789
**Method** : GET
**URL Params** : token=[authentication key]
**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)
**Sample Return** : { "duke-*-edu": "Duke University", "sandiego-*-edu": "University of San Diego" }


**Title** : Get the minimun version of Walla that is supported
**Sample URL** : /api/min_version?token=123456789&platform=android
**Method** : GET
**URL Params** : token=[authentication key], platform=[android or ios]
**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)
**Sample Return** : {"min_version":"1.0.3"}


**Title** : Get the current active activities
**Sample URL** : /api/activities?token=123456789&domain=sandiego-*-edu
**Method** : GET
**URL Params** : token=[authentication key], domain=[school that will be used to filter the activities]
**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)
**Sample Return** : { "-KXztdYqayNltsE4TyqH": { "activityTime": 1480716024.079, "description": "Pokemon Kickback Friday!", "interest": "Other", "key": "-KXztdYqayNltsE4TyqH", "location": "CSGD", "locationSaved": false, "numberGoing": 1, "sent": true, "timePosted": 1480688308, "uid": "s5bdUshkPfe3v0QdA2QrnqjpYXN2" }, "-KY-xJxVqtgOQWiKEgW0": { "activityTime": 1480706452, "description": "Costco run", "interest": "Rides", "key": "-KY-xJxVqtgOQWiKEgW0", "location": "Wilson 212a", "locationSaved": true, "numberGoing": 1, "sent": true, "timePosted": 1480706051.961459, "uid": "cie2GsseUtdARbfdpCx8HiVgtgf2" }}


**Title** : Get an array of users who are attending a specific event
**Sample URL** : /api/attendees?token=123456789&domain=sandiego-*-edu&event=fht4yrt4
**Method** : GET
**URL Params** : token=[authentication key], domain=[school that will be used to filter the activities], event=[unique key of the event]
**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)
**Sample Return** : 


**Title** : View information of a certain user
**Sample URL** : /api/user_info?token=123456789&domain=sandiego-*-edu&uid=84ubr73i9
**Method** : GET
**URL Params** : token=[authentication key], domain=[school that will be used to filter the activities], event=[unique key of the event], uid=[user's id]
**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)
**Sample Return** : {"emailVerificationSent":false,"lastOpened":1478065176.643259,"name":"Judy Zhu USD","profile_image":"","timeCreated":1478065149.356971,"verified":true}


