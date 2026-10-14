---
title: Shell completions
description: Tab completion for bash, zsh, fish, powershell, and elvish.
---

```sh
liber completion bash >> ~/.bashrc
liber completion zsh > "${fpath[1]}/_liber"
liber completion fish > ~/.config/fish/completions/liber.fish
liber completion powershell >> $PROFILE
liber completion elvish >> ~/.elvish/lib/liber.elv
```

Restart the shell (or source the file) and tab-complete subcommands, flags, and shells. The exact destination depends on your setup; the commands above follow each shell's conventional location.

Next: [Syncing across devices](/cli/sync/).
