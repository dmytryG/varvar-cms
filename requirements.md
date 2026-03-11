- Data is saved as a simple JSON string and populated from the front-end admin panel using a JSON editor.
- Data is grouped: admin panel -> project -> page (document unit)
- Internationalization is supported for each individual page
- Each page has versioning (let's keep it up to version 100 for now)
- Must run on Express.js
- Must be written in ts
- Must be a library, so the user creates a project, includes the library, and the library deploys the front-end and back-end admin panel. The front-end should be served via Express and be React-based. Configuration occurs on the user side, for example, in main.ts. - Database - Mongo to avoid migrations
- The user must have access to Express and Mongo, and be able to add custom controllers and mid-level tools
- Authorization is required for admins
- Each page must have an isPublished state. When an admin clicks "Publish," a new version of the page is created. The isPublished checkbox is removed from all other page versions, filtered by page and language, and set only for the latest, current version (so that when a request for a page arrives, it can be quickly found by Mongo).
- There must be a public REST API for read-only published functionality
- Caching must be modularly enabled

Iteration 1: Let's setup a architecture pact. I won't be too pedantic, services should include business logic and
logic for working with DB, they have to be static classes with static async methods. They have to be stored
in /src/services/<SubjectArea>Service.ts. Controllers should be in /src/controllers/<SubjectArea>Controller.ts. Also
let's add data validation with yup, validator schemas should be in /src/validators/<SubjectArea>Validator.ts. Middlewares
should be in /src/middlewares/<SubjectArea>Middleware.ts.

Iteration 2: For this iteration, implement simple JWT token based authorization for admins on BE. so registration 
(if it's a first user, it's automatically registers as ADMIN), login, endpoint so ADMIN users could set roles for 
other users. I suppose, for now we'll only have two roles ADMIN and USER. Methods required: register, login, 
getUsers, setRole, getMe. Also needed middleware for authorization check, that middleware should accept role as a
parameter.

Iteration 3: Let's establish UI part of the CMS. Clean architecture too, simple UI, react router, toastify, separated
file for all API requests. Let's start with auth implementation