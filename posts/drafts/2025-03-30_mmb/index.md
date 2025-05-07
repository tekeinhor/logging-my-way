---
title: Mourir Moins Bete
desc: |
    Mourir Moins Bete translated, die a little bit less stupid.
tags:
  - python
---

I just discovered a thing about python, and I felt stupid.

```sh
.
└──my_project/
   ├── __init__.py
   ├── file.py   <---
   └── my_module/
      ├── __init__.py
      ├── sub_module1/
      │   ├── __init__.py
      │   ├── my_file
      │   └── another_file.py
      └──sub_module2/
         ├── __init__.py
         ├── my_file
         └── another_file.py
```

from file you want to

```py
from my_project.my_module import submodule1
from my_project.my_module import submodule2

submodule1.my_file???? nope
submodule2.my_file???? nope

but my_project.my_module.submodule1.my_file works
```


Why is that? because python doesn't automatically import submodules

https://stackoverflow.com/questions/8899198/module-has-no-attribute

my fix?

```py
#my_project.my_module.sub_module1.__init__.py

from . import my_file
from . import another_file
```



mock where you are patching -> https://docs.python.org/3/library/unittest.mock.html#where-to-patch
