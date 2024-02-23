---
title: path.join Considered Harmful, or openat() All The Things
desc: Say goodbye to path traversal attacks by using modern kernel facilities and get ready for the capabilities-secure future at the same time!
---

Soooo… isn't it absurd that we have this hierarchical and dynamic structure called the file system, and the way we use it is by pretty much always traversing it from the root, by path, constructing paths using [string manipulation tricks](https://security.stackexchange.com/q/123720) to hopefully try to be safe against both [attacks](https://owasp.org/www-community/attacks/Path_Traversal) and [accidents](https://www.theregister.com/2015/01/17/scary_code_of_the_week_steam_cleans_linux_pcs/)?

Yes. Yes, it is. Very much absurd and ridiculous. Just think about it. And despair. Or actually, don't despair; instead, I want YOU to start caring about this and to join the fight for changing it! As we'll see, the system interfaces have actually been evolving to make this situation better.

In this article we'll learn the history of how Unix-like systems got a way to make stable references to filesystem subtrees and perform operations relative to those, explore the current state of filesystem APIs in various programming languages, and—hopefully—get motivated to improve that.

## From race conditions…

As it is with many good things in this life, the `*at` family of system calls was invented at Sun Microsystems.
Specifically back in the early 00s, when Solaris 10 has introduced the `openat`/`fchownat`/`fstatat`/`futimesat`/`renameat`/`unlinkat`/`utimensat` calls as a method to avoid race conditions / time of check vs time of use issues.
Namely, this kind:

```c
#define STATE_DIR "/var/db/thing/"
if (stat(STATE_DIR "ok", &sb) != 0) return false;
// in between these calls some other process screws with what /var/db/thing means
// e.g. overwriting what a symlink points to
int db_fd = open(STATE_DIR "data", O_RDWR);
// we ended up referring to one thing at time of check and another at time of use
```

Before, it was only possible to avoid these by changing the current working directory and using relative paths from there (!), which was quite an ugly hack, especially bad because the working directory is *per-process* state, so it wasn't even thread-safe. That's actually kinda really funny, isn't it? "You can have ONE stable reference to a directory, as a treat," said Unix.

The solution they came up with was using directory file descriptors and adding operations *relative to them*, hence `*at`:

```c
int state_dir = open("/var/db/thing", O_DIRECTORY /* checks that it is a dir */);
if (fstatat(state_dir, "ok", &sb, 0) != 0) return false;
int db_fd = openat(state_dir, "data", O_RDWR);
```

From there, it has found its way into Linux, initially as userspace-only [procfs trickery](https://lists.gnu.org/archive/html/bug-gnulib/2005-11/msg00043.html) but finally available as a set of real system calls in version [2.6.16](https://kernelnewbies.org/Linux_2_6_16) from 2006.
Then the POSIX.1-2008 standard has included these `*at` calls and they were picked up by all the BSDs: first DragonFly and FreeBSD around 2008-09, OpenBSD a bit later in 2011, and the holdouts were NetBSD until late 2014 and macOS until late 2015.

## …to sandboxing…

Suspiciously soon after these calls were added to FreeBSD, the [Capsicum project](https://www.cl.cam.ac.uk/research/security/capsicum/) at Cambridge came up with a way to build capability-based security for Unix.
FreeBSD was the main target for prototyping, and the work got upstreamed for 9.0 and enabled by default in 10.0.
There also was a Linux port sponsored by Google, with an implementation of the consumer side in Chromium, but all that sadly didn't go anywhere.

So, what is the idea there, anyway?

Turns out, exactly these `*at` calls are at the core of it.
You see, while the original use case for kernel-level handles to directories was race condition avoidance, the researchers realized the great sandboxing potential of them.
The [capability model](https://en.wikipedia.org/wiki/Capability-based_security) has turned out to map very well onto the POSIX API: file descriptors are already unforgeable handles that indicate access to a resource.
They can be passed between processes, inherited by child processes… and `openat` is exactly how you go from a more-privileged filesystem capability (e.g. a descriptor to `/etc` signifying access to the whole subtree under `/etc`) to a less-privileged one (a descriptor to `/etc/passwd` signifying access to only that file).

Well, provided you restrict it to actually only do the lookup beneath the directory and never escape it.
*Capability mode* does exactly that, along with disabling all access to *global namespaces*, i.e. the ability to just `open()` whatever by a global path, to reference a process by PID, that kind of thing.
The idea is that you open the directories and other resources you anticipate working with, and then sandbox yourself to the resources you have and those derived from them.
For example, roughly like this:

```c
int web_root = open("/var/www/site", O_DIRECTORY);
int tcp_sock = socket(PF_INET6, SOCK_STREAM, 0);
// bind, listen etc. omitted
cap_enter(); // also check the return code lol
// here we can accept client connections and talk to them,
// access files under /var/www/site, and nothing more
while (fd = event_loop_thing_poll(pfds)) {
  if (fd == tcp_sock) {
    event_loop_thing_add(pfds, accept(tcp_sock, NULL, NULL));
  } else {
    char *requested_path = read_request(fd);
    int ffd = openat(web_root, requested_path, O_RDONLY);
    sendfile(ffd, fd, /* … */);
    close(ffd);
  }
}
```

There are additional features like fine-grained limits [called "rights"](https://man.freebsd.org/cgi/man.cgi?cap_rights_limit) that are inherited by everything derived from a capability and can only be reduced, never expanded—so like, you can have a directory handle so damn read-only that files opened below it using `openat` could never be read-write—but that is the core idea.
As a result, we have one of the strongest process sandboxes out there, based on a principled thought-out model instead of arbitrary deny/allow lists.
The tradeoff is however that it's not as easy to sandbox existing software into such a paradigm-shifting system, so e.g. OpenBSD gets to tout a bigger quick practical impact of their pledge+unveil system :)
However some [great](https://www.youtube.com/watch?v=ErXtGMmRzJs) [research](https://www.youtube.com/watch?v=TGA4wbjbqXc) has been done since into mechanisms for retrofitting existing applications, and I'm sometimes trying to [continue](https://reviews.freebsd.org/D38351) that line of reseach myself.

## …to the mainstream…

So quite a few years later, during the explosion of various "cloud services" (advanced ways of running your code on someone else's computer), this idea was extended further.
[CloudABI](https://lwn.net/Articles/674770/) (2016) was an attempt to define a sandboxed application format for "the cloud" based on a simple idea:
what if we just have a new OS-neutral ABI that already starts in Capsicum capability mode and doesn't include any syscalls inappropriate for that, i.e. ones that use global namespaces?

The design was very clever.
Resources would be injected before program start by a launcher that would make that easy.
The system call interface was entirely [vDSO](https://en.wikipedia.org/wiki/VDSO)-based, one of the implications of which was that it was possible to run CloudABI binaries—without the sandboxing—on unmodified Linux and macOS using the launcher, allowing for developers to get on board easily.

Sadly, native (secure) support only got upstreamed to FreeBSD and nowhere else, and the project fizzled out due to lack of industry interest.
Not without leaving a huge influence behind though!

At the same time, [WebAssembly](https://webassembly.org/) was taking off as a solution for another level of sandboxing and abstraction, the machine level.
Born out of [previous efforts](https://en.wikipedia.org/wiki/Asm.js) to compile existing C/C++ projects (as big as game engines) to the browser, Wasm has quickly expanded into a huge array of other use cases as well, because of what it actually ended up being: the most lightweight and neutral low-level abstract machine.

Currently it seems to be catching on in the "cloud" industry, which has been looking for alternatives to heavyweight full-OS virtualization as the security boundary.
That was helped by the "next big thing" being "edge" instead of "cloud", which mostly seems to mean running customer code all across a worldwide CDN instead of in just a few huge datacenters.
But the hype was all around a secure abstract machine when in reality the need for a common secure ABI was arguably even bigger there – assuming your goal isn't explicitly doing vendor lock-in by providing a custom interface instead of a standard one :D
(Hm, would it have helped if CloudABI was instead named EdgeABI?)

Anyway, thankfully, what's fulfilling the need for an ABI is [WASI, the WebAssembly System Interface](https://wasi.dev/), which is… basically kinda sorta just a `wasm32-cloudabi` target if you look at it! (Well, with the whole [Component Model](https://component-model.bytecodealliance.org/introduction.html) thing that's only going to be one aspect of it but still.)
The [WASI overview](https://github.com/bytecodealliance/wasmtime/blob/4ba8b6c0d99d258aa0a4ed4ee7c687fcddae6c8e/docs/WASI-overview.md) explicitly references CloudABI and Capsicum.
And even the aforementioned research into Capsicumizing existing software in the form of [libpreopen](https://github.com/musec/libpreopen).
In a way, we have won after all! :)
The industry-hyped, Wasm-workgroup-blessed, by-all-compilers-supported ABI for POSIX-y applications is based on exactly these ideas.

## …and back to the regular syscall interfaces…

Meanwhile, other Things have been Happening with the system call API design all this time, right in the normal Unix-like kernels of "the present" that we actually run on hardware.

Way back in 2011, [Linux 2.6.39](https://kernelnewbies.org/Linux_2_6_39) introduced the `O_PATH` flag which allows opening, well, "only the path"—getting a stable reference to an inode—without actually opening the *contents*. These descriptors can only be used with operations that don't care about the contents, like the `*at()` calls we're discussing. In most cases, this is just an optimization: not opening what we don't  *need* opened. It's fine to "fully" open a directory and then `openat()` below. However the difference in semantics comes into play especially [with symbolic links](https://github.com/flatpak/xdg-desktop-portal/pull/532#issuecomment-734305639). To support these semantics as required by xdg-document-portal, FreeBSD got `O_PATH` merged [in 2021](https://reviews.freebsd.org/rG8d9ed174f3afba5f114742447e622fc1173d4774), a whole decade later.

But the most important feature making directory descriptors attractive? The ability to do strictly-beneath lookups, like all lookups are under Capsicum, but no matter if your whole process is in a sandbox mode or not. Having an explicit flag in the API enables the developer to just pass a reference to a directory and tell the kernel to open a path *definitely under* that subtree in the file system, without worrying about processing the path carefully to avoid escapes.

This was first proposed for FreeBSD [back in 2015](https://reviews.freebsd.org/D2808) as `O_BENEATH` and [landed in late 2018](https://reviews.freebsd.org/D17547) in the development branch. Then [Linux 5.6](https://kernelnewbies.org/Linux_5.6) in 2020 shipped with the [openat2()](https://www.man7.org/linux/man-pages/man2/openat2.2.html) syscall that adds a bunch of controls over path resolution behavior, including the `RESOLVE_BENEATH` flag implementing the Capsicum-style behavior. Almost immediately after FreeBSD has [added `O_RESOLVE_BENEATH`](https://reviews.freebsd.org/D25886) with the correct behavior since it was discovered that the original `O_BENEATH` one actually wasn't working as intended (oops); then [the original `O_BENEATH` was removed](https://reviews.freebsd.org/D28907). For FreeBSD 14 there was also a [fix landed](https://reviews.freebsd.org/D39773) to avoid the "`/..` is `/`" behavior when opening beneath a descriptor pointing to the root directory, to make the behavior equivalent to Linux, at the request of the author of a library that I've [added FreeBSD support to](https://github.com/bytecodealliance/cap-std/pull/296) which finally landed just recently, speaking of which..

## …and that's where you come in!

So. We have arrived at the current point in time, where we have decent kernel support for holding references to directories in the file system and doing useful things with them, like safely opening files strictly beneath the directory. Now what's needed the most is: adoption, adoption, adoption!

**In Rust**, use the [cap-std crate](https://github.com/bytecodealliance/cap-std#cap-std)! It's an excellent library that provides an appropriate high-level API for directory references:

```rust
// somewhere in initialization
let mut root = Dir::open_ambient_dir("/var/www/memes", ambient_authority()).unwrap();

// fn do_the_work(/* user input */ name: &str)
let img = root.open(format!("out-{}.avif.tmp", name))?;
let log = root.open_with(
    format!("log-{}.txt", name),
    OpenOptions::new().create(true).write(true)
)?;
root.rename(
    format!("out-{}.avif.tmp", name),
    root,
    format!("out-{}.avif", name)
)?; // etc.
```

And it takes advantage of modern Linux and FreeBSD system call API features to make this fast, while still supporting other platforms with a fallback method (essentially doing a system call per path component which should honestly be *fine* in most cases).

**In other languages**, I'm not yet aware of cap-std equivalents; please do start working on your own! Or sponsor me to work on one for your favorite language I guess! :)

The basic idea of what such a library would be is this:

```c
int open_beneath(int dirfd, const char *pathname, int flags, mode_t mode) {
#ifdef __FreeBSD__
	// TODO: validate flags/mode to match Linux behavior
	return openat(dirfd, pathname, flags | O_RESOLVE_BENEATH, mode);
#elif defined(__linux__)
	struct open_how how = {
		.flags = flags,
		.mode = mode,
		.resolve = RESOLVE_BENEATH,
	};
	return (int)syscall(SYS_openat2, dirfd, pathname, &how, sizeof(how));
#else
#error "TODO: the whole fallback algorithm from cap-std"
#endif
}

// same with other operations
```

**For young or evolving languages**, advocate for this paradigm to be incorporated into the standard library or "blessed" external libraries! I've noticed some awareness of the aforementioned ideas in this space:

* in the Zig standard library, [the `Dir` type is an fd wrapper with `*at` ops](https://github.com/ziglang/zig/blob/804cee3b93cb7084c16ee61d3bcb57f7d3c9f0bc/lib/std/fs/Dir.zig#L1) but sadly as of right now there's no attempt at providing the `RESOLVE_BENEATH` behavior;
* the new OCaml I/O library `eio` has a [sandboxed dir type](https://github.com/ocaml-multicore/eio/blob/4856fc430db261eb4c9e90107f0f629e1284d945/lib_eio_posix/fs.ml#L19-L23) that for now uses `realpath` + string trickery and doesn't hold an fd, but the authors are aware that it probably should and `RESOLVE_BENEATH` exists.

It would be really awesome if we could push for a cap-std-like API to be the recommended default one everywhere.