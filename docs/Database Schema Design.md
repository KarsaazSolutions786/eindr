<a name="_8k0q311kihy0"></a>Database Schema Design

**Prepared By**: Idrees Khan

-----
### <a name="_3uwywjg7gi82"></a>**1. Overview**
This document outlines the relational database schema design for the Eindr application. The backend uses PostgreSQL with the pgvector extension enabled for embedding-based similarity searches, especially for habit detection and AI-assisted features. Redis is also used for caching, queuing, and fast access to frequently requested data.

-----
### <a name="_97iwoncn0bk4"></a>**2. Core Tables**
#### <a name="_ic14jrxxrb9d"></a>**2.1 users**
Stores user profile and basic settings.

CREATE TABLE users (

`  `id UUID PRIMARY KEY,

`  `email VARCHAR(255) UNIQUE NOT NULL,

`  `language VARCHAR(10),

`  `timezone VARCHAR(50),

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_a62q5fj19p0f"></a>**2.2 preferences**
Stores user preferences related to app behavior.

CREATE TABLE preferences (

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `allow\_friends BOOLEAN DEFAULT TRUE,

`  `receive\_shared\_notes BOOLEAN DEFAULT TRUE,

`  `notification\_sound VARCHAR(100),

`  `tts\_language VARCHAR(10),

`  `chat\_history\_enabled BOOLEAN DEFAULT TRUE,

`  `PRIMARY KEY(user\_id)

);

#### <a name="_9wufz1q7msv2"></a>**2.3 reminders**
Stores all reminders including one-time and recurring.

CREATE TABLE reminders (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `title TEXT NOT NULL,

`  `description TEXT,

`  `time TIMESTAMP,

`  `repeat\_pattern VARCHAR(50),

`  `timezone VARCHAR(50),

`  `is\_shared BOOLEAN DEFAULT FALSE,

`  `created\_by UUID REFERENCES users(id),

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_9ysrjasgdk2j"></a>**2.4 notes**
Stores user-generated voice or manual notes.

CREATE TABLE notes (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `content TEXT,

`  `source VARCHAR(20), -- voice/manual/friend

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_9h8y6st0pody"></a>**2.5 ledger\_entries**
Tracks voice-logged debts and credits between users.

CREATE TABLE ledger\_entries (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `contact\_name VARCHAR(100),

`  `amount NUMERIC(10, 2),

`  `direction VARCHAR(10) CHECK (direction IN ('owe', 'owed')),

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_ftxy65tu8gbe"></a>**2.6 friendships**
Manages friend relationships and states.

CREATE TABLE friendships (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `friend\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')),

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_vzwexl1vt2hf"></a>**2.7 permissions**
Defines friend-level sharing permissions.

CREATE TABLE permissions (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `friend\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `auto\_accept\_reminders BOOLEAN DEFAULT FALSE,

`  `auto\_accept\_notes BOOLEAN DEFAULT FALSE,

`  `updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_7ylzig5jrx7w"></a>**2.8 embeddings**
Stores vector embeddings for reminders or habits.

CREATE TABLE embeddings (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `reminder\_id UUID REFERENCES reminders(id) ON DELETE SET NULL,

`  `embedding VECTOR(384),

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

#### <a name="_j42ouax04qm5"></a>**2.9 history\_logs**
Stores past AI conversations and voice interaction logs.

CREATE TABLE history\_logs (

`  `id UUID PRIMARY KEY,

`  `user\_id UUID REFERENCES users(id) ON DELETE CASCADE,

`  `content TEXT,

`  `interaction\_type VARCHAR(20), -- reminder, note, ledger, etc.

`  `created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

-----
### <a name="_pkzll2uwqd16"></a>**3. Indexes & Optimization**
- Full-text search indexes on reminders.title, notes.content, history\_logs.content
- GIN index on any JSONB fields (if used in preferences)
- Vector index for embedding matching:

CREATE INDEX idx\_embedding\_vector ON embeddings USING ivfflat (embedding vector\_cosine\_ops);

-----
### <a name="_ggz78ktfohyk"></a>**4. Redis Usage (Caching Layer)**
- **Session Storage**: Active login tokens and auth session states
- **Cache Keys**: Frequently requested items (reminder summaries, user profiles)
- **Queue Jobs**: Async ledger processing, batch reminders, contact match jobs
-----
**Conclusion**:
This schema supports the full functionality of the Eindr app, ensuring smooth handling of reminders, notes, friend logic, financial tracking, chat history, and AI-based habit detection. It integrates Redis and pgvector to support speed and smart insights at scale.

