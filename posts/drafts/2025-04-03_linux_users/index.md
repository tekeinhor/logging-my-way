---
title: Linux Users
desc: |
    Step by step guide to create linux users
tags:
  - python
---


- list all user
```sh
cat /etc/passwd
```

- list all group
```sh
cat /etc/group
```

- list group members
  
```sh 
# option 1 -> require groupmems (which might be installed by default) -> 
$ groupmems -g groupname -l

# option 2
$ grep group_name /etc/group
```

[source](https://unix.stackexchange.com/questions/241215/how-can-i-find-out-which-users-are-in-a-group-within-linux)


```sh

useradd <user_name>

useradd <user_name> <group_name>


sudo visudo /etc

username ALL=(ALL:ALL) NOPASSWD: ALL
```