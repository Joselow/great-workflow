LOGS

id uuid pk
user_id int
meeting_id uuid null
type_meeting_link int # log-meet | 
meet-log | null
description text      #que
responsable varchar   #quien
tags varchar          #categoria 
completed boolean,null.                                            
comment text, nullable.                          
timestamps         
---
TAGS
id int pk
user_id int
name varchar
color varchar
---
MEETINGS
id uuid pk
user_id int
date datetime
estimated_duration int #mins
state text
objetive varchar
summary text
lessons text
timestamps 
executed boolean
objetive_achieved boolean
