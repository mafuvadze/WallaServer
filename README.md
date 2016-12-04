Walla API Documentation
==============

## Get the domains supported by Walla

- **Sample URL** : /api/domains?token=123456789

- **Method** : GET

- **URL Params** : token=[authentication key]

- **Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)




**Title** : Get the minimun version of Walla that is supported

**Sample URL** : /api/min_version?token=123456789&platform=android

**Method** : GET

**URL Params** : token=[authentication key], platform=[android or ios]

**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)




**Title** : Get the current active activities

**Sample URL** : /api/activities?token=123456789&domain=sandiego-*-edu

**Method** : GET

**URL Params** : token=[authentication key], domain=[school that will be used to filter the activities]

**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)



**Title** : Get an array of users who are attending a specific event

**Sample URL** : /api/attendees?token=123456789&domain=sandiego-*-edu&event=fht4yrt4

**Method** : GET

**URL Params** : token=[authentication key], domain=[school that will be used to filter the activities], event=[unique key of the event]

**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)



**Title** : View information of a certain user

**Sample URL** : /api/user_info?token=123456789&domain=sandiego-*-edu&uid=84ubr73i9

**Method** : GET

**URL Params** : token=[authentication key], domain=[school that will be used to filter the activities], event=[unique key of the event], uid=[user's id]

**Response Codes**: Success (200 OK), Bad Request (400), Unauthorized (401)



