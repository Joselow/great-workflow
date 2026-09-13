LOGS

id uuid pk
user_id int
project_id uuid
meeting_id uuid nullable
type_meeting_link varchar # log-meet | 
meet-log | nullable
description text      #que
responsable varchar   #quien
tags varchar          #categoria 
completed boolean, nullable                                         
comment text, nullable.                          
timestamps                             
---
TAGS
id int pk
user_id int
name varchar
color varchar
project_id uuid
---
MEETINGS
id uuid pk
user_id int
date datetime
project_id uuid nullable.
estimated_duration int #mins
state text
objetive varchar
summary text
lessons text
timestamps 
executed boolean
objetive_achieved boolean

---
PROJECTS
id uuid pk
user_id int
name varchar
description text nullable
color varchar
timestamps

---
CARDS
id uuid pk
project_id nullable
meeting_id uuid nullable
user_id id 
name uuid
description varchar
color varchar
timestamps
is_prompt
fl_meeting

