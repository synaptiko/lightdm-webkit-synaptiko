## Yet Another LightDM Webkit greeter theme

This is a theme for [LightDM Webkit2 Greeter](https://aur.archlinux.org/packages/lightdm-webkit2-greeter).

It's designed to be minimalistic theme with accent on [Arch Linux](https://www.archlinux.org). It's inspired a lot by other existing themes. Colors are loosely derived from [Arc Theme](https://github.com/horst3180/arc-theme/) in its darker variant.

It's written in pure css and javascript, **without any deps** like various transpilers, css frameworks and jQuery used in other themes.

### Screenshot

**It has clock!**
![Clocks](/../screenshots/preview.png?raw=true)

**…and login dialog too**
![Login screen](/../screenshots/preview.png?raw=true)

### Features

I created this for use on Arch Linux, so it only has the basic features of:

- A clock!
- Selecting an available user from a dropdown
- Entering their password
- Seeing their profile picture
- Four zen-themed wallpapers

### How to use

Clock is shown by default. You can either press `Enter` or click on the dialog.

The first user is pre-selected and password field is focused, so you can start typing your password. In case the password is invalid the field is marked by red color and you can try it once again.

You can also choose different user. By pressing `Esc` the login is dismissed and Clock shown again.

Wallpaper can be easily changed by `Alt+Left/Right arrow`, index of selected one is saved to local storage, so it should remain between restarts.

### How to install

Instructions will differ for every platform, but I can tell you how to install it on Arch Linux:

1. Install and enable `lightdm` and `lightdm-webkit2-greeter`
2. In the terminal, `cd` to `/usr/share/lightdm-webkit/themes/`
3. Clone this repository here, into a folder called `synaptiko`
4. Enable the theme in your `/etc/lightdm/lightdm-webkit-greeter2.conf` as follows:

```
[greeter]
webkit-theme=synaptiko
```

### Setting your own user picture

There are a couple of methods you can use to set your user picture in LightDM:

- Put a `jpg` of your face in your home directory as a file called `.face`

or

- Add `Icon=/var/lib/AccountsService/icons/<youraccountname>.png` to the bottom of `/var/lib/AccountsService/users/<youraccountname>`

### License

This work is free. You can redistribute it and/or modify it under the terms of the WTFPL (Do What The Fuck You Want To Public License), Version 2, as published by Sam Hocevar. See http://www.wtfpl.net/ for more details.

Wallpapers downloaded from [pixabay](https://pixabay.com/) where they are hopefully published under [CC0](https://creativecommons.org/choose/zero/):
- https://pixabay.com/en/stone-beach-nature-pebble-rock-1052500/
- https://pixabay.com/en/balance-nature-rocks-zen-1157487/
- https://pixabay.com/en/harmony-relax-rock-moqui-stone-1229892/
- https://pixabay.com/en/harmony-relax-rock-moqui-stone-1229893/
