# Notes

- Main application controller
    - session-handler.js: Account controllers (accepts socket, events on user login or new user register)

	- Room Pool: collection of active room instances. Has hash table of rooms id's -> instances?
		Used for active room lookup, when user moves. Rooms are removed from pool when no more users are within one room of it.

		- Active Room Instance Object:
		    Active rooms are any room with a user in it, and all surrounding rooms (n,s,e,w,u,d). Rooms are deleted when no users are within one room of it.
		    - Room Id: new Room Controller
			- Users (hash): References to active users
			- Nearby users (array)?
			- NPC's (hash): References to NPC objects
			- Items (hash)
			- Room Model
				- Description (string)
				- Attributes (Object) 
				- 'static' elements in room
				- Player/room modifiers
				- Name/ID
				- Coordinates
			- Has an EventEmitter instance for subscribing to user events published to the object. Passes a reference to the object to each user that enters the room.
			- Has a reference to the global event emitter, for publishing events to global
			- Actions hash for room interactions, called based on user-driven events

	- User Pool: collection of active user instances. Hash table of user id's -> instances?
		Contains all active user instances, manages global messaging & communications

		- Active User Instance Object: Active users are active user connections
		- User Socket
		- User ID/Name
		- User Model:
			- Name
			- Title
			- Class
			- Description
			- Skills (name array)
			- Spells (name array)
			- Abilities (name array)
			- Level
			- Stats
				- HP
				- Mana
				- Strength
				- Concentration
				- Speed
				- Weight Capacity
			- Owned Items/Inventory (item id array)
			- Worn Items
			- Current Room id
		- Available actions (mixin? Factory pattern based on class, abilities, items, skills?)
		- Current Room (object)
		- Adjacent Rooms (hash table of directions and room id's?)
		- Publishes events to currentRoom
		- Actions hash, created via factory method w/mixins for abilities, spells, items. Some action types bubble events up to room.
		- Inventory (array of objects?)
		- Worn Items (hash, item location on body)
		- Carrying Weight

	- Item objects:
		Item instances are created when a room with that item becomes active, or a user with that item becomes active. They exist on the user or room instance.

	- Global Event Emitter (pub sub object?) for communicating things globally

	- Combat controller: new instance created when users/NPCs engage in combat, controls combat turns/actions

	- Help Files controller: singleton, methods for user to query help files db

	- News/Announcements controller: singleton, retrieves any news/announcement records from the db, on user login or user request


## Next Steps:

- Create base collection class
- Create global user collection object for storing all active client connections
